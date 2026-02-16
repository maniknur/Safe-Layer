/**
 * SafeLayer Risk Intelligence Engine - Frontend Types
 */

export type RiskLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
export type AddressType = 'wallet' | 'contract' | 'token';
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

// ─── Evidence Flag (core unit of proof) ───
export interface EvidenceFlag {
  id: string;
  name: string;
  severity: Severity;
  description: string;
  evidence: string;
  category: string;
  source?: string;
  codeSnippet?: string;
  bscscanLink?: string;
  riskWeight: number;
}

// ─── On-Chain Indicator (table row) ───
export interface OnChainIndicator {
  indicator: string;
  evidence: string;
  riskWeight: number;
}

// ─── Risk Breakdown ───
export interface RiskBreakdown {
  contract_risk: number;
  behavior_risk: number;
  reputation_risk: number;
}

// ─── Legacy compatibility ───
export interface RiskComponents {
  transactionRisk: number;
  contractRisk: number;
  liquidityRisk: number;
  behavioralRisk: number;
}

// ─── Score Calculation Transparency ───
export interface ScoreCalculation {
  formula: string;
  weights: {
    contract_risk: number;
    behavior_risk: number;
    reputation_risk: number;
  };
  rawScores: {
    contract_risk: number;
    behavior_risk: number;
    reputation_risk: number;
  };
  adjustments: string[];
  finalScore: number;
}

// ─── Contract Detections ───
export interface ContractDetections {
  ownerPrivileges: boolean;
  withdrawFunctions: boolean;
  mintFunctions: boolean;
  proxyPattern: boolean;
  noRenounceOwnership: boolean;
  upgradeability: boolean;
  selfDestruct: boolean;
  honeypotLogic: boolean;
}

// ─── Analysis Sub-Results ───
export interface ContractAnalysisResult {
  isContract: boolean;
  isVerified: boolean;
  sourceCodeAvailable: boolean;
  codeSize: number;
  compilerVersion?: string;
  detections: ContractDetections;
  score: number;
}

export interface OnChainMetrics {
  topHolderConcentration: number | null;
  contractAgeDays: number | null;
  holderCount: number | null;
  transactionCount: number;
  balance: string;
  liquidityBNB: string | null;
  hasDexPair: boolean;
  rugPullRisk: number;
}

export interface OnChainAnalysisResult {
  metrics: OnChainMetrics;
  score: number;
}

export interface WalletAnalysisResult {
  deployedContracts: string[];
  linkedRugpulls: string[];
  fundFlowSummary: string;
  transactionCount: number;
  ageInDays: number;
  balanceBNB: string;
  score: number;
}

export interface TransparencyAnalysisResult {
  github: {
    found: boolean;
    repoUrl?: string;
    lastCommitDate?: string;
    contributorsCount?: number;
    starsCount?: number;
  };
  audit: {
    detected: boolean;
    auditorName?: string;
    reportUrl?: string;
  };
  teamDoxxed: boolean;
  score: number;
}

export interface ScamDatabaseResult {
  isBlacklisted: boolean;
  knownScam: boolean;
  rugpullHistory: boolean;
  matchedDatabase: string[];
  score: number;
}

// ─── Explanation ───
export interface RiskExplanation {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  riskFactors: string[];
}

// ─── Full API Response ───
export interface RiskData {
  success: boolean;
  address: string;
  riskScore: number;
  riskLevel: RiskLevel;
  rugPullRisk: number;
  addressType: AddressType;

  // Category breakdown
  breakdown: RiskBreakdown;

  // Legacy components
  components: RiskComponents;

  // Evidence panels
  evidence: {
    contract_flags: EvidenceFlag[];
    onchain_flags: EvidenceFlag[];
    wallet_flags: EvidenceFlag[];
    transparency_flags: EvidenceFlag[];
    scam_flags: EvidenceFlag[];
  };

  // Detailed analysis
  analysis: {
    contract: ContractAnalysisResult;
    onchain: OnChainAnalysisResult;
    wallet: WalletAnalysisResult;
    transparency: TransparencyAnalysisResult;
    scamDatabase: ScamDatabaseResult;
  };

  // On-chain indicators table
  onchainIndicators: OnChainIndicator[];

  // Score transparency
  scoreCalculation: ScoreCalculation;

  // Legacy string flags
  flags: string[];

  // Explanation
  explanation: RiskExplanation;

  // On-chain registry
  registry: RegistryData | null;

  // Meta
  timestamp: string;
  analysisTimeMs: number;
}

// ─── On-Chain Registry ───
export interface OnChainProof {
  txHash: string;
  blockNumber: number;
  reportHash: string;
  gasUsed: string;
}

export interface OnChainReport {
  targetAddress: string;
  riskScore: number;
  riskLevel: string;
  reportHash: string;
  timestamp: string;
  analyzer: string;
}

export interface RegistryData {
  contractAddress: string;
  onChainProof: OnChainProof | null;
  previousReport: OnChainReport | null;
  totalReportsForAddress: number;
  submissionStatus: 'confirmed' | 'skipped';
  submissionError: string | null;
}

export interface SearchHistoryItem {
  address: string;
  riskScore: number;
  riskLevel: RiskLevel;
  timestamp: string;
}
