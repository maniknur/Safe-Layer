/**
 * Risk Aggregator Module
 * Combines risk scores from all modules into a comprehensive risk assessment
 */

import { analyzeWallet } from '../wallet/walletAnalyzer';
import { analyzeLiquidity } from '../liquidity/liquidityAnalyzer';
import { scanContract } from '../scanner/contractScanner';
import { detectSuspiciousActivity } from '../wallet/walletAnalyzer';
import { detectLiquidityAnomalies } from '../liquidity/liquidityAnalyzer';
import logger from '../../utils/logger';

export interface RiskScore {
  overallScore: number;
  walletRisk: number;
  smartContractRisk: number;
  liquidityRisk: number;
  rugPullRisk: number;
  components: {
    transactionRisk: number;
    contractRisk: number;
    liquidityRisk: number;
    behavioralRisk: number;
  };
  flags: string[];
  addressType: 'wallet' | 'contract' | 'token';
}

export type RiskLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';

export function getRiskLevel(score: number): RiskLevel {
  if (score < 20) return 'Very Low';
  if (score < 40) return 'Low';
  if (score < 60) return 'Medium';
  if (score < 80) return 'High';
  return 'Very High';
}

/**
 * Analyze and aggregate all risk factors for an address
 */
export async function analyzeRisk(address: string): Promise<RiskScore> {
  logger.info(`Starting risk analysis for ${address}`);

  // Fetch data from all modules in parallel
  const [walletData, liquidityData, contractData, suspiciousFlags, liquidityAnomalies] = await Promise.all([
    analyzeWallet(address),
    analyzeLiquidity(address),
    scanContract(address),
    detectSuspiciousActivity(address),
    detectLiquidityAnomalies(address),
  ]);

  // Calculate individual risk components
  const transactionRisk = walletData.riskScore;
  const contractRisk = contractData.riskScore;
  const liquidityRisk = liquidityData.riskScore;

  // Behavioral risk based on real suspicious activity flags
  let behavioralRisk = 0;
  if (suspiciousFlags.length > 0) {
    behavioralRisk = Math.min(suspiciousFlags.length * 15, 60);
  }
  if (liquidityAnomalies.length > 0) {
    behavioralRisk += Math.min(liquidityAnomalies.length * 10, 40);
  }
  behavioralRisk = Math.min(behavioralRisk, 100);

  // Determine address type
  let addressType: 'wallet' | 'contract' | 'token' = 'wallet';
  if (contractData.isContract) {
    addressType = liquidityData.hasPancakeswapPair ? 'token' : 'contract';
  }

  // Weighted aggregation - CRITICAL: Wallet behavior must significantly impact overall risk
  // Wallet behavior (transaction history, activity) - 45% weight (PRIMARY FACTOR)
  // Contract security & code - 25% weight (IMPORTANT)  
  // Liquidity risk - 20% weight (MODERATE)
  // Behavioral anomalies - 10% weight (ADDITIONAL)
  const weights = {
    transaction: 0.45,
    contract: 0.25,
    liquidity: 0.20,
    behavioral: 0.10,
  };

  let overallScore = Math.round(
    transactionRisk * weights.transaction +
    contractRisk * weights.contract +
    liquidityRisk * weights.liquidity +
    behavioralRisk * weights.behavioral
  );

  // CRITICAL: If any major component is MEDIUM or higher, ensure overall reflects it
  // This prevents underestimation when one factor is problematic
  const majorComponents = [transactionRisk, contractRisk, liquidityRisk];
  const maxComponentRisk = Math.max(...majorComponents);
  
  // Floor rules: Ensure major risk components pull up overall score appropriately
  if (maxComponentRisk >= 40) {
    // Component is MEDIUM (40-60): Overall should be at least Low-Medium (38)
    overallScore = Math.max(overallScore, 38);
  }
  if (maxComponentRisk >= 50) {
    // Component is distinctly MEDIUM: Overall should be Medium minimum (42)
    overallScore = Math.max(overallScore, 42);
  }
  if (maxComponentRisk >= 60) {
    // Component is MEDIUM-HIGH: Overall should be Medium (50)
    overallScore = Math.max(overallScore, 50);
  }
  if (maxComponentRisk >= 75) {
    // Component is HIGH: Overall should be High (65)
    overallScore = Math.max(overallScore, 65);
  }
  if (maxComponentRisk >= 85) {
    // Component is VERY HIGH: Overall should be Very High (80)
    overallScore = Math.max(overallScore, 80);
  }

  // Combine all flags
  const flags = [...suspiciousFlags, ...liquidityAnomalies];
  if (contractData.risksFound.length > 0) {
    flags.push(...contractData.risksFound);
  }

  // CRITICAL: Risk flags must validate overall score
  // Multiple red flags indicate significant concerns that should be reflected in overall score
  if (flags.length >= 3) {
    // 3+ red flags = significant risk. Overall should be at least Medium (45)
    overallScore = Math.max(overallScore, 45);
  }
  if (flags.length >= 5) {
    // 5+ red flags = substantial risk. Overall should be at least Medium-High (60)
    overallScore = Math.max(overallScore, 60);
  }
  if (flags.length >= 7) {
    // 7+ red flags = major risk issues. Overall should be at least High (75)
    overallScore = Math.max(overallScore, 75);
  }

  logger.info(`Risk analysis complete for ${address}: overall=${overallScore}, flags=${flags.length}, type=${addressType}`);

  return {
    overallScore: Math.min(overallScore, 100),
    walletRisk: walletData.riskScore,
    smartContractRisk: contractRisk,
    liquidityRisk: liquidityData.riskScore,
    rugPullRisk: liquidityData.rugPullRisk,
    components: {
      transactionRisk,
      contractRisk,
      liquidityRisk,
      behavioralRisk,
    },
    flags,
    addressType,
  };
}

/**
 * Get risk justification based on score
 */
export function getRiskJustification(score: number): string {
  if (score < 20) return 'Address shows low risk profile with good security practices.';
  if (score < 40) return 'Address has acceptable risk profile with minor concerns.';
  if (score < 60) return 'Address shows moderate risk that warrants caution.';
  if (score < 80) return 'Address has significant risk factors requiring careful consideration.';
  return 'Address exhibits high risk characteristics - extreme caution advised.';
}
