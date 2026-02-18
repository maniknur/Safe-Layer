/**
 * Proof Verifier
 *
 * Verifies that risk report proofs are correctly stored on-chain.
 * Demonstrates the immutable verification process:
 *   1. Take original report data
 *   2. Hash it locally (keccak256)
 *   3. Query on-chain report for the address
 *   4. Compare hashes — if match, proof is valid
 */

import { ethers } from 'ethers';

const RPC_URL = process.env.BNB_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const REGISTRY_ADDRESS = process.env.REGISTRY_CONTRACT_ADDRESS || '0x20B28a7b961a6d82222150905b0C01256607B5A3';

const REGISTRY_ABI = [
  'function getLatestReportForTarget(address targetAddress) external view returns (tuple(address targetAddress, uint8 riskScore, uint8 riskLevel, bytes32 reportHash, uint256 timestamp, address analyzer))',
] as const;

export interface VerificationResult {
  address: string;
  verified: boolean;
  localHash: string;
  onChainHash: string | null;
  onChainScore: number | null;
  onChainTimestamp: string | null;
  onChainAnalyzer: string | null;
  error?: string;
}

export class ProofVerifier {
  private contract: ethers.Contract;

  constructor() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
  }

  /**
   * Quick verify — checks if the local hash matches on-chain
   */
  async verify(
    address: string,
    reportData: object,
    expectedHash?: string
  ): Promise<boolean> {
    const result = await this.verifyFull(address, reportData, expectedHash);
    return result.verified;
  }

  /**
   * Full verification with detailed result
   */
  async verifyFull(
    address: string,
    reportData: object,
    expectedHash?: string
  ): Promise<VerificationResult> {
    // Step 1: Hash the report data locally
    const localHash = expectedHash || ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(reportData))
    );

    try {
      // Step 2: Query on-chain report
      const report = await this.contract.getLatestReportForTarget(address);

      const onChainHash = report.reportHash;
      const onChainScore = Number(report.riskScore);
      const onChainTimestamp = new Date(Number(report.timestamp) * 1000).toISOString();
      const onChainAnalyzer = report.analyzer;

      // Step 3: Compare hashes
      const verified = localHash.toLowerCase() === onChainHash.toLowerCase();

      return {
        address,
        verified,
        localHash,
        onChainHash,
        onChainScore,
        onChainTimestamp,
        onChainAnalyzer,
      };
    } catch {
      return {
        address,
        verified: false,
        localHash,
        onChainHash: null,
        onChainScore: null,
        onChainTimestamp: null,
        onChainAnalyzer: null,
        error: 'No on-chain report found for this address',
      };
    }
  }
}
