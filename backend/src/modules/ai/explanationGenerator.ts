/**
 * AI Explanation Generator Module
 * Generates human-readable explanations for risk scores
 */

import { RiskScore, getRiskLevel } from '../aggregator/riskScorer';

export interface RiskExplanation {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  riskFactors: string[];
}

/**
 * Generate AI-powered explanation for a risk assessment
 */
export async function generateExplanation(
  riskScore: RiskScore,
  address: string
): Promise<RiskExplanation> {
  const keyFindings: string[] = [];
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  const score = riskScore.overallScore;
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown';

  // Address type context
  if (riskScore.addressType === 'token') {
    keyFindings.push(`Address is a token contract with PancakeSwap trading pair.`);
  } else if (riskScore.addressType === 'contract') {
    keyFindings.push(`Address is a smart contract without a known DEX trading pair.`);
  } else {
    keyFindings.push(`Address is an externally owned account (wallet).`);
  }

  // Analyze risk components
  if (riskScore.walletRisk > 50) {
    keyFindings.push('Wallet shows patterns typical of new or inactive accounts.');
    riskFactors.push('Limited transaction history');
  } else if (riskScore.walletRisk > 30) {
    keyFindings.push('Wallet has moderate activity level.');
    riskFactors.push('Below-average transaction count');
  }

  if (riskScore.smartContractRisk > 50) {
    keyFindings.push('Smart contract analysis reveals potential security concerns.');
    riskFactors.push('Unverified or potentially vulnerable smart contract');
    recommendations.push('Review contract source code and audit reports before interaction.');
  } else if (riskScore.smartContractRisk > 20) {
    keyFindings.push('Smart contract shows minor concerns in bytecode analysis.');
    riskFactors.push('Contract requires further verification');
  }

  if (riskScore.liquidityRisk > 50) {
    keyFindings.push('Liquidity analysis indicates potential volatility or low trading depth.');
    riskFactors.push('Low or concentrated liquidity pools');
    recommendations.push('Check liquidity depth and token distribution before trading.');
  } else if (riskScore.liquidityRisk > 25) {
    keyFindings.push('Liquidity levels are moderate - monitor for changes.');
  }

  // Rug pull risk
  if (riskScore.rugPullRisk > 60) {
    keyFindings.push('High rug pull probability detected based on liquidity patterns.');
    riskFactors.push('Elevated rug pull risk');
    recommendations.push('Avoid large investments - high probability of liquidity removal.');
  } else if (riskScore.rugPullRisk > 30) {
    riskFactors.push('Moderate rug pull risk');
    recommendations.push('Start with small amounts and monitor liquidity changes.');
  }

  // Flags from analysis
  if (riskScore.flags.length > 0) {
    const significantFlags = riskScore.flags.filter(
      f => !f.includes('No obvious risks') && !f.includes('not a smart contract')
    );
    if (significantFlags.length > 0) {
      keyFindings.push(`${significantFlags.length} risk indicator(s) detected during analysis.`);
      riskFactors.push(...significantFlags.slice(0, 3));
    }
  }

  // General recommendations based on score
  if (score >= 60) {
    recommendations.push('Verify address authenticity before significant transactions.');
    recommendations.push('Use a hardware wallet for interactions with this address.');
    recommendations.push('Set spending limits and approval amounts carefully.');
  } else if (score >= 40) {
    recommendations.push('Standard security practices recommended.');
    recommendations.push('Consider additional verification for large transactions.');
  } else {
    recommendations.push('Address appears safe for regular interactions.');
    recommendations.push('Continue to monitor for any changes in risk profile.');
  }

  // Generate summary
  const riskLevel = getRiskLevel(score);
  let summary = '';
  switch (riskLevel) {
    case 'Very Low':
      summary = `${shortAddr} shows a strong security profile with minimal risk indicators. Safe for standard interactions on BNB Chain.`;
      break;
    case 'Low':
      summary = `${shortAddr} has an acceptable security profile with minor concerns. Standard caution advised for BNB Chain transactions.`;
      break;
    case 'Medium':
      summary = `${shortAddr} has moderate risk factors. Exercise reasonable caution and verify before significant transactions.`;
      break;
    case 'High':
      summary = `${shortAddr} exhibits notable risk indicators. Significant due diligence recommended before any interaction.`;
      break;
    case 'Very High':
      summary = `${shortAddr} shows high-risk characteristics. Extreme caution and thorough verification required before proceeding.`;
      break;
  }

  return {
    summary,
    keyFindings: keyFindings.length > 0 ? keyFindings : ['No significant findings in primary risk categories.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring standard security practices.'],
    riskFactors: riskFactors.length > 0 ? riskFactors : ['No major risk factors detected.'],
  };
}
