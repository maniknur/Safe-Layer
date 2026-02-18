/**
 * Query Registry Tool
 *
 * Queries the SafeLayerRegistry smart contract for existing
 * risk reports on an address. Read-only — no gas costs.
 */

import { ethers } from 'ethers';
import type { PluginAPI } from '../index';

const REGISTRY_ADDRESS = process.env.REGISTRY_CONTRACT_ADDRESS || '0x20B28a7b961a6d82222150905b0C01256607B5A3';
const RPC_URL = process.env.BNB_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const ANALYZER_PRIVATE_KEY = process.env.ANALYZER_PRIVATE_KEY || '';

// Minimal read-only ABI
const REGISTRY_ABI = [
  'function getLatestReportForTarget(address targetAddress) external view returns (tuple(address targetAddress, uint8 riskScore, uint8 riskLevel, bytes32 reportHash, uint256 timestamp, address analyzer))',
  'function getReportCountForTarget(address targetAddress) external view returns (uint256)',
  'function getTotalReports() external view returns (uint256)',
  'function approvedAnalyzers(address) external view returns (bool)',
] as const;

const RISK_LEVEL_LABELS = ['LOW', 'MEDIUM', 'HIGH'] as const;

// Lazy-initialized read contract
let _readContract: ethers.Contract | null = null;

function getReadContract(): ethers.Contract {
  if (!_readContract) {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    _readContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
  }
  return _readContract;
}

function getAnalyzerAddress(): string {
  if (!ANALYZER_PRIVATE_KEY) return '';
  const wallet = new ethers.Wallet(ANALYZER_PRIVATE_KEY);
  return wallet.address;
}

interface QueryParams {
  address: string;
}

export function registerQueryRegistryTool(api: PluginAPI): void {
  api.registerTool({
    name: 'bnb_query_registry',
    description:
      'Queries the SafeLayerRegistry smart contract for existing risk reports on an address. ' +
      'Returns the latest report (if any), report count, total registry entries, and analyzer approval status. ' +
      'Use this BEFORE analyzing to check for existing reports and avoid duplicate work.',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'BNB Chain address to query (0x followed by 40 hex characters)',
        },
      },
      required: ['address'],
    },
    async execute(_id: string, params: Record<string, unknown>) {
      const { address } = params as unknown as QueryParams;
      const contract = getReadContract();
      const analyzerAddress = getAnalyzerAddress();

      try {
        // Query in parallel for speed
        const [reportCount, totalReports, analyzerApproved] = await Promise.all([
          contract.getReportCountForTarget(address).then(Number).catch(() => 0),
          contract.getTotalReports().then(Number).catch(() => 0),
          analyzerAddress
            ? contract.approvedAnalyzers(analyzerAddress).catch(() => false)
            : Promise.resolve(false),
        ]);

        // Get latest report only if reports exist
        let latestReport = null;
        if (reportCount > 0) {
          try {
            const report = await contract.getLatestReportForTarget(address);
            latestReport = {
              targetAddress: report.targetAddress,
              riskScore: Number(report.riskScore),
              riskLevel: RISK_LEVEL_LABELS[Number(report.riskLevel)] || 'UNKNOWN',
              reportHash: report.reportHash,
              timestamp: new Date(Number(report.timestamp) * 1000).toISOString(),
              analyzer: report.analyzer,
            };
          } catch {
            // NoReportsForTarget — skip
          }
        }

        const result = {
          address,
          hasExistingReport: latestReport !== null,
          latestReport,
          reportCount,
          totalRegistryReports: totalReports,
          analyzerApproved,
          analyzerAddress: analyzerAddress || 'not configured',
          contractAddress: REGISTRY_ADDRESS,
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Registry query failed: ${message}` }),
          }],
        };
      }
    },
  });
}
