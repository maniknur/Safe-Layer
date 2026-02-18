/**
 * Submit On-Chain Tool
 *
 * Hashes a risk report (keccak256 of JSON) and submits the proof
 * to the SafeLayerRegistry smart contract on BNB Chain.
 *
 * Contract: SafeLayerRegistry (0x20B28a7b961a6d82222150905b0C01256607B5A3)
 * Function: submitRiskReport(address, uint8 riskScore, uint8 riskLevel, bytes32 reportHash)
 * Event:    RiskReportSubmitted(address indexed, uint8, uint8, bytes32 indexed, address indexed, uint256)
 */

import { ethers } from 'ethers';
import type { PluginAPI } from '../index';

// ─── Contract Configuration ───
const REGISTRY_ADDRESS = process.env.REGISTRY_CONTRACT_ADDRESS || '0x20B28a7b961a6d82222150905b0C01256607B5A3';
const RPC_URL = process.env.BNB_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const ANALYZER_PRIVATE_KEY = process.env.ANALYZER_PRIVATE_KEY || '';

// Minimal ABI — only the functions we need
const REGISTRY_ABI = [
  'function submitRiskReport(address targetAddress, uint8 riskScore, uint8 riskLevel, bytes32 reportHash) external',
  'event RiskReportSubmitted(address indexed targetAddress, uint8 riskScore, uint8 riskLevel, bytes32 indexed reportHash, address indexed analyzer, uint256 timestamp)',
] as const;

// Risk level enum matching Solidity: LOW=0, MEDIUM=1, HIGH=2
function scoreToOnChainLevel(score: number): number {
  if (score <= 33) return 0; // LOW
  if (score <= 66) return 1; // MEDIUM
  return 2;                   // HIGH
}

// Hash report data to produce on-chain proof (must match backend schema)
function hashReport(report: object): string {
  const json = JSON.stringify(report);
  return ethers.keccak256(ethers.toUtf8Bytes(json));
}

// ─── Lazy-initialized contract instances ───
let _provider: ethers.JsonRpcProvider | null = null;
let _writeContract: ethers.Contract | null = null;
let _walletAddress = '';

function getWriteContract(): ethers.Contract | null {
  if (!ANALYZER_PRIVATE_KEY) return null;
  if (!_writeContract) {
    _provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ANALYZER_PRIVATE_KEY, _provider);
    _walletAddress = wallet.address;
    _writeContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet);
  }
  return _writeContract;
}

interface SubmitParams {
  address: string;
  riskScore: number;
  riskLevel: string;
  breakdown: {
    contract_risk: number;
    behavior_risk: number;
    reputation_risk: number;
  };
}

export function registerSubmitOnChainTool(api: PluginAPI): void {
  api.registerTool({
    name: 'bnb_submit_onchain',
    description:
      'Hashes a risk report (keccak256) and submits the proof to the SafeLayerRegistry ' +
      'smart contract on BNB Chain. Emits RiskReportSubmitted event. ' +
      'Returns transaction hash, block number, gas used, and report hash. ' +
      'Requires ANALYZER_PRIVATE_KEY to be configured.',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Target address that was analyzed',
        },
        riskScore: {
          type: 'number',
          description: 'Risk score 0-100 from the analysis',
        },
        riskLevel: {
          type: 'string',
          description: 'Risk level: Very Low, Low, Medium, High, or Very High',
        },
        breakdown: {
          type: 'object',
          description: 'Score breakdown by category',
          properties: {
            contract_risk: { type: 'number' },
            behavior_risk: { type: 'number' },
            reputation_risk: { type: 'number' },
          },
          required: ['contract_risk', 'behavior_risk', 'reputation_risk'],
        },
      },
      required: ['address', 'riskScore', 'riskLevel', 'breakdown'],
    },
    async execute(_id: string, params: Record<string, unknown>) {
      const { address, riskScore, riskLevel, breakdown } = params as unknown as SubmitParams;

      const contract = getWriteContract();
      if (!contract) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'ANALYZER_PRIVATE_KEY not configured. Cannot submit on-chain.',
            }),
          }],
        };
      }

      // Build report data object (matches backend schema for hash consistency)
      const reportData = {
        address: address.toLowerCase(),
        riskScore,
        riskLevel,
        breakdown,
        timestamp: new Date().toISOString(),
        schemaVersion: '2.0' as const,
      };

      const reportHash = hashReport(reportData);
      const onChainLevel = scoreToOnChainLevel(riskScore);

      try {
        // Submit to SafeLayerRegistry contract
        const tx = await contract.submitRiskReport(
          address,
          riskScore,
          onChainLevel,
          reportHash
        );

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        const result = {
          success: true,
          txHash: receipt.hash,
          blockNumber: Number(receipt.blockNumber),
          gasUsed: receipt.gasUsed.toString(),
          reportHash,
          onChainRiskLevel: onChainLevel,
          onChainRiskLevelLabel: ['LOW', 'MEDIUM', 'HIGH'][onChainLevel],
          analyzerAddress: _walletAddress,
          contractAddress: REGISTRY_ADDRESS,
          explorerUrl: `https://testnet.bscscan.com/tx/${receipt.hash}`,
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error
          ? (err as { reason?: string }).reason || err.message
          : 'Unknown error';

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message,
              reportHash,
              hint: message.includes('NotAnalyzer')
                ? 'The wallet is not approved as an analyzer on the contract. The contract owner must call approveAnalyzer().'
                : undefined,
            }),
          }],
        };
      }
    },
  });
}
