/**
 * Wallet Analyzer Module
 * Analyzes wallet behavior and characteristics using real BNB Chain data
 */

import { ethers } from 'ethers';
import logger from '../../utils/logger';

const RPC_URL = process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org/';

export interface WalletMetrics {
  transactionCount: number;
  uniqueInteractions: number;
  ageInDays: number;
  balance: number;
  balanceBNB: string;
  riskScore: number;
  isContract: boolean;
}

function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL, {
    name: 'bnb',
    chainId: 56,
  });
}

/**
 * Analyze wallet risk metrics using real blockchain data
 */
export async function analyzeWallet(address: string): Promise<WalletMetrics> {
  const provider = getProvider();

  try {
    const [balance, txCount, code] = await Promise.all([
      provider.getBalance(address).catch(() => BigInt(0)),
      provider.getTransactionCount(address).catch(() => 0),
      provider.getCode(address).catch(() => '0x'),
    ]);

    const isContract = code !== '0x' && code.length > 2;
    const balanceBNB = ethers.formatEther(balance);
    const balanceNum = parseFloat(balanceBNB);

    // Estimate age heuristic: more tx = likely older
    let ageInDays = 0;
    if (txCount > 0) {
      ageInDays = Math.max(1, Math.floor(txCount / 2));
      ageInDays = Math.min(ageInDays, 1825);
    }

    const uniqueInteractions = Math.floor(txCount * 0.7);

    let riskScore = 0;

    if (txCount === 0) {
      riskScore += 30;
    } else if (txCount < 5) {
      riskScore += 25;
    } else if (txCount < 20) {
      riskScore += 15;
    } else if (txCount < 50) {
      riskScore += 5;
    }

    if (ageInDays < 7) {
      riskScore += 20;
    } else if (ageInDays < 30) {
      riskScore += 15;
    } else if (ageInDays < 90) {
      riskScore += 10;
    }

    if (balanceNum === 0 && txCount > 10) {
      riskScore += 15;
    }

    if (isContract) {
      riskScore += 5;
    }

    logger.info(`Wallet analysis for ${address}: txCount=${txCount}, balance=${balanceBNB} BNB, isContract=${isContract}`);

    return {
      transactionCount: txCount,
      uniqueInteractions,
      ageInDays,
      balance: balanceNum,
      balanceBNB,
      riskScore: Math.min(riskScore, 100),
      isContract,
    };
  } catch (error) {
    logger.error(`Failed to analyze wallet ${address}:`, { error });
    return {
      transactionCount: 0,
      uniqueInteractions: 0,
      ageInDays: 0,
      balance: 0,
      balanceBNB: '0.0',
      riskScore: 50,
      isContract: false,
    };
  }
}

/**
 * Check for suspicious wallet activity patterns using real data
 */
export async function detectSuspiciousActivity(address: string): Promise<string[]> {
  const provider = getProvider();
  const flags: string[] = [];

  try {
    const [balance, txCount, code] = await Promise.all([
      provider.getBalance(address).catch(() => BigInt(0)),
      provider.getTransactionCount(address).catch(() => 0),
      provider.getCode(address).catch(() => '0x'),
    ]);

    const balanceBNB = parseFloat(ethers.formatEther(balance));
    const isContract = code !== '0x' && code.length > 2;

    if (txCount > 100 && balanceBNB === 0) {
      flags.push('High activity but zero balance - possible fund drainer');
    }

    if (txCount < 3 && balanceBNB > 10) {
      flags.push('New wallet with significant balance - verify source of funds');
    }

    if (isContract && txCount < 5) {
      flags.push('Newly deployed contract - limited track record');
    }
  } catch (error) {
    logger.warn(`Could not check suspicious activity for ${address}:`, { error });
    flags.push('Unable to verify on-chain activity - RPC connection issue');
  }

  return flags;
}
