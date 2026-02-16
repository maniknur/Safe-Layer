/**
 * Smart Contract Scanner Module
 * Analyzes smart contract code for potential risks using real BNB Chain data
 */

import { ethers } from 'ethers';
import logger from '../../utils/logger';

const RPC_URL = process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org/';

export interface ScanResult {
  contractAddress: string;
  risksFound: string[];
  riskScore: number;
  isVerified: boolean;
  isContract: boolean;
  codeSize: number;
}

function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL, {
    name: 'bnb',
    chainId: 56,
  });
}

const PROXY_PATTERNS = [
  '363d3d373d3d3d363d73', // EIP-1167 minimal proxy
];

/**
 * Scan a smart contract for risks using real blockchain data
 */
export async function scanContract(contractAddress: string): Promise<ScanResult> {
  const provider = getProvider();
  const risks: string[] = [];
  let riskScore = 0;

  try {
    const code = await provider.getCode(contractAddress).catch(() => '0x');
    const isContract = code !== '0x' && code.length > 2;
    const codeSize = isContract ? (code.length - 2) / 2 : 0;

    if (!isContract) {
      return {
        contractAddress,
        risksFound: ['Address is not a smart contract (EOA wallet)'],
        riskScore: 0,
        isVerified: false,
        isContract: false,
        codeSize: 0,
      };
    }

    const codeLower = code.toLowerCase();

    // Check for proxy patterns
    const isProxy = PROXY_PATTERNS.some(pattern => codeLower.includes(pattern));
    if (isProxy) {
      risks.push('Proxy contract detected - logic can be changed by owner');
      riskScore += 15;
    }

    if (codeSize < 100) {
      risks.push('Very small contract bytecode - possibly minimal proxy or stub');
      riskScore += 10;
    }

    if (codeSize > 24576) {
      risks.push('Large contract bytecode - complex logic, harder to audit');
      riskScore += 5;
    }

    // Source verification would need BscScan API key
    const isVerified = false;
    if (!isVerified) {
      risks.push('Contract source code verification not confirmed');
      riskScore += 10;
    }

    const txCount = await provider.getTransactionCount(contractAddress).catch(() => 0);
    if (txCount === 0) {
      risks.push('Contract has no outgoing transactions');
      riskScore += 5;
    }

    if (risks.length === 0) {
      risks.push('No obvious risks detected in bytecode analysis');
    }

    logger.info(`Contract scan for ${contractAddress}: isContract=${isContract}, codeSize=${codeSize}, risks=${risks.length}`);

    return {
      contractAddress,
      risksFound: risks,
      riskScore: Math.min(riskScore, 100),
      isVerified,
      isContract,
      codeSize,
    };
  } catch (error) {
    logger.error(`Failed to scan contract ${contractAddress}:`, { error });
    return {
      contractAddress,
      risksFound: ['Unable to scan contract - RPC connection issue'],
      riskScore: 40,
      isVerified: false,
      isContract: false,
      codeSize: 0,
    };
  }
}

/**
 * Analyze contract interaction risk score
 */
export async function analyzeContractInteractions(address: string): Promise<number> {
  const provider = getProvider();

  try {
    const txCount = await provider.getTransactionCount(address);
    if (txCount > 1000) return 5;
    if (txCount > 100) return 15;
    if (txCount > 10) return 25;
    return 35;
  } catch {
    return 30;
  }
}
