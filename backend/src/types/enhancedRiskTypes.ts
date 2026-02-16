/**
 * Enhanced Type Definitions for Explainable Risk Intelligence Engine
 * Supports multi-layered evidence-based risk analysis
 */

// ============================================================================
// ==================== CONTRACT ANALYSIS TYPES ==============================
// ============================================================================

export type ContractFlagSeverity = 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'INFO';

export interface ContractFlag {
  id: string;                    // Unique ID: "SELFDESTRUCT", "NO_VERIFY", etc.
  severity: ContractFlagSeverity;
  name: string;                  // Display name
  description: string;           // What the issue is
  riskExplanation: string;       // Why it's dangerous
  codeSnippet?: string;          // The problematic code from contract
  lineNumber?: number;           // Source code line number
  bscscanLink: string;           // Direct link to BscScan verified contract
  remediation?: string;          // How developers can fix it
  confidence: number;            // 0-100: How confident are we about this flag
  category: 'SECURITY' | 'OWNERSHIP' | 'UPGRADE' | 'CODE_QUALITY';
}

export interface ProxyPattern {
  isProxy: boolean;
  implementation?: string;       // Implementation contract address
  proxyType?: 'UUPS' | 'Transparent' | 'Beacon' | 'UNKNOWN';
  adminAddress?: string;
  upgradeability: string;        // "Immutable" | "Upgradeable" | "Unknown"
}

export interface ContractAnalysis {
  address: string;
  isContract: boolean;
  isVerified: boolean;           // Source code verified on BscScan
  sourceCode?: string;
  compilerVersion?: string;
  constructorArguments?: string;
  
  ownership: {
    ownerAddress?: string;
    ownerCount?: number;
    isRenounced?: boolean;
    multiSigWallet?: boolean;
  };
  
  proxies?: ProxyPattern[];
  
  functionality: {
    isMintable?: boolean;
    maxMintAmount?: string;
    isPausable?: boolean;
    hasWithdraw?: boolean;
    hasSelfdestruct?: boolean;
    hasUnsafeLoops?: boolean;
  };
  
  flags: ContractFlag[];
  riskScore: number;             // 0-100
  riskFactors: string[];         // Top risk factors summary
  
  codeMetrics?: {
    linesOfCode: number;
    complexity: number;
    commentRatio: number;
  };
}

// ============================================================================
// ==================== ON-CHAIN BEHAVIOR TYPES ==============================
// ============================================================================

export interface OnchainBehaviorFlag {
  category: 'HOLDER_CONCENTRATION' | 'LIQUIDITY' | 'TRANSACTION' | 'DEPLOYER' | 'AGE';
  indicator: string;
  value: string | number;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'INFO';
  evidence: string;
  riskWeight: number;           // Impact on overall score (0-100)
  supportingData?: {
    transactions?: string[];
    holders?: string[];
    timestamps?: number[];
    blockNumbers?: number[];
  };
}

export interface LargeTransferEvent {
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  amount: string;               // In wei
  isToFreshWallet: boolean;
  walletAge?: number;           // Days old if fresh wallet
  txHash: string;
  bscscanLink: string;
}

export interface OnchainBehaviorAnalysis {
  address: string;
  
  contractAge: {
    ageInDays: number;
    deploymentBlock: number;
    deploymentTime: number;
    ageRiskLevel: string;        // Based on how new contract is
  };
  
  holderConcentration: {
    top1PercentOwned: number;
    top5PercentOwned: number;
    top10PercentOwned: number;
    totalHolders: number;
    concentrationRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    interpretation: string;
  };
  
  liquidityAnalysis: {
    totalLiquidity: string;       // In USD
    lockedPercentage: number;
    liquidityAgeInDays?: number;
    lastLiquidityAddBlock?: number;
    hasLockedLiquidity: boolean;
    recentRemovalEvents: number;  // Last 7 days
    volatility24h: number;        // %
    slippage5kBnB?: number;       // Expected slippage
  };
  
  transactionPatterns: {
    txCount24h: number;
    txCount7d: number;
    txCount30d: number;
    uniqueSenders24h: number;
    averageGasUsed?: number;
    gasAnomalies: boolean;
    largeTransferEvents: LargeTransferEvent[];
    txClusteringDetected: boolean;
  };
  
  deployerAnalysis: {
    address: string;
    ageInDays: number;
    totalTransactions: number;
    otherContracts: number;
    rugpullHistoryCount: number;
    suspectedRugpullCount: number;
    amlBlacklisted: boolean;
    sanctioned: boolean;
    linkedWallets: Array<{
      address: string;
      relationship: string;
      contracts: string[];
    }>;
  };
  
  flags: OnchainBehaviorFlag[];
  riskScore: number;             // 0-100
}

// ============================================================================
// ==================== WALLET HISTORY TYPES =================================
// ============================================================================

export interface DeployedContractHistory {
  address: string;
  deployedAt: number;
  block: number;
  status: 'ACTIVE' | 'RUGPULLED' | 'HONEYPOT' | 'SAFE' | 'UNKNOWN';
  riskLevel: string;
  bscscanLink: string;
  victims?: number;
  lossUSD?: number;
}

export interface RugpullHistory {
  confirmedRugpulls: number;
  suspectedRugpulls: number;
  totalVictims: number;
  totalLossUSD: number;
  lastRugpullDate?: number;
  affectedTokens: string[];
}

export interface LinkedWallet {
  address: string;
  relationship: 'DEPLOYER' | 'OWNER' | 'FOUNDER' | 'OPERATOR' | 'BUYER';
  sharedContracts: string[];
  confidence: number;
}

export interface WalletHistoryAnalysis {
  address: string;
  ageInDays: number;
  totalTransactions: number;
  totalVolumeETH: string;
  
  deployedContracts: DeployedContractHistory[];
  
  rugpullHistory: RugpullHistory;
  
  linkedWallets: LinkedWallet[];
  
  amlStatus: {
    blacklisted: boolean;
    sanctioned: boolean;
    reason?: string;
    source?: string;
    riskScore: number;           // 0-100
  };
  
  walletPatterns: {
    reusedPatterns: boolean;     // Deployer reuses same patterns?
    previousScams: number;
    highRiskBehavior: boolean;
  };
  
  flags: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  
  riskScore: number;             // 0-100
}

// ============================================================================
// ==================== GITHUB & TRANSPARENCY TYPES ==========================
// ============================================================================

export interface AuditReport {
  firm: string;
  date: string;
  reportUrl: string;
  status: 'PASSED' | 'FINDINGS' | 'CRITICAL';
  findingsCount?: number;
  criticalIssues?: number;
}

export interface TeamMember {
  name: string;
  role: string;
  linkedIn?: string;
  twitter?: string;
  github?: string;
  doxxed: boolean;
}

export interface GitHubAnalysis {
  address: string;
  repositoryFound: boolean;
  url?: string;
  queryTerm?: string;            // What we searched for
  
  activity: {
    lastCommitDate?: string;
    lastCommitHash?: string;
    commitCount?: number;
    hasActiveCommits: boolean;   // Within 30 days
    committerCount?: number;
    pullRequestsOpen?: number;
    pullRequestsMerged?: number;
  };
  
  documentation: {
    hasReadme: boolean;
    hasWhitepaper: boolean;
    hasRoadmap: boolean;
    hasMaintainers: boolean;
    documentationQuality: number; // 0-100
  };
  
  audits: AuditReport[];
  
  team: {
    membersIdentified: number;
    anyDoxxed: boolean;
    members: TeamMember[];
  };
  
  communityMetrics: {
    stars: number;
    forks: number;
    watchers: number;
    issues: number;
    discussions: number;
  };
  
  riskFlags: Array<{
    type: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'INFO';
    description: string;
    isNegative: boolean;        // False if it's positive evidence
  }>;
  
  transparencyScore: number;     // 0-100
  riskScore: number;             // 0-100
}

// ============================================================================
// ==================== SCAM & THREAT DATABASE TYPES =========================
// ============================================================================

export type ThreatType = 'KNOWN_SCAM' | 'RUGPULL' | 'HONEYPOT' | 'BLACKLIST' | 'reported' | 'PHISHING';

export interface ThreatRecord {
  type: ThreatType;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  source: string;               // Database name (rugpull.io, honeypot.is, etc.)
  reportedDate: number;
  reportCount: number;          // How many reports?
  evidence: string;
  url?: string;                 // Link to threat report
  affectedUsers?: number;
  totalLoss?: number;
}

export interface ScamDatabaseAnalysis {
  address: string;
  
  threats: ThreatRecord[];
  
  riskFactors: string[];
  
  overallThreatLevel: 'SAFE' | 'CAUTION' | 'CRITICAL';
  
  riskScore: number;            // 0-100
}

// ============================================================================
// ==================== RISK CALCULATION TYPES ===============================
// ============================================================================

export interface RiskDimension {
  name: string;
  score: number;               // 0-100
  weight: number;              // As decimal (0.0-1.0)
  factors: string[];
}

export interface FloorRule {
  condition: string;
  minimumScore: number;
  applied: boolean;
  appliedBecause: string;
}

export interface CalculationTransparency {
  description: string;
  formula: string;             // Human-readable formula
  weights: {
    contractRisk: number;
    onchainBehavior: number;
    reputation: number;
    transparency: number;
    behavioral: number;
  };
  componentScores: {
    contractRisk: number;
    onchainBehavior: number;
    reputation: number;
    transparency: number;
    behavioral: number;
  };
  weightedValues: {
    contractRisk: number;
    onchainBehavior: number;
    reputation: number;
    transparency: number;
    behavioral: number;
  };
  baseScore: number;           // Before floor rules
  floorRules: FloorRule[];
  finalScore: number;          // After floor rules
  explanation: string;         // Why the score is what it is
}

// ============================================================================
// ==================== PROOF REFERENCES TYPES ==============================
// ============================================================================

export interface ProofReference {
  type: string;                // 'BSCSCAN_CONTRACT', 'BSCSCAN_TX', 'GITHUB', 'REPORT'
  label: string;               // Display text
  url: string;
  blockNumber?: number;
  transactionHash?: string;
  timestamp?: number;
}

// ============================================================================
// ==================== ENHANCED RISK ANALYSIS RESPONSE =======================
// ============================================================================

export interface EnhancedExplanation {
  summary: string;             // One sentence summary
  keyFindings: string[];       // 3-5 most important findings
  riskFactors: string[];       // Evidence-based risk factors
  recommendations: string[];   // What the user should do
  interpretation: string;      // Why the score is significant
}

export interface EnhancedRiskAnalysisResponse {
  // Basic Information
  success: boolean;
  address: string;
  addressType: 'wallet' | 'contract' | 'token';
  timestamp: string;
  analysisTimeMs: number;
  
  // Risk Summary
  riskScore: number;           // 0-100
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  
  // Detailed Risk Breakdown
  breakdown: {
    contractRisk: {
      score: number;
      level: string;
      factors: string[];
    };
    onchainBehaviorRisk: {
      score: number;
      level: string;
      factors: string[];
    };
    reputationRisk: {
      score: number;
      level: string;
      factors: string[];
    };
    transparencyRisk: {
      score: number;
      level: string;
      factors: string[];
    };
    behavioralAnomalies: {
      score: number;
      level: string;
      factors: string[];
    };
  };
  
  // Evidence Panels
  evidence: {
    contractAnalysis?: ContractAnalysis;
    onchainBehavior?: OnchainBehaviorAnalysis;
    walletHistory?: WalletHistoryAnalysis;
    transparency?: GitHubAnalysis;
    threatDatabase?: ScamDatabaseAnalysis;
  };
  
  // Calculation Transparency
  calculationFormula: CalculationTransparency;
  
  // Simple Explanation
  explanation: EnhancedExplanation;
  
  // Proof References
  proofReferences: {
    bscscanLinks: ProofReference[];
    blockNumber?: number;
    transactionHashes?: string[];
    reportLinks?: ProofReference[];
  };
}

// ============================================================================
// ==================== BACKWARD COMPATIBILITY ===============================
// ============================================================================

// Keep legacy types for gradual migration
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

export interface RiskExplanation {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  riskFactors: string[];
}

export interface RiskData {
  success: boolean;
  address: string;
  riskScore: number;
  riskLevel: string;
  rugPullRisk: number;
  addressType: string;
  breakdown: {
    walletRisk: number;
    smartContractRisk: number;
    liquidityRisk: number;
  };
  components: {
    transactionRisk: number;
    contractRisk: number;
    liquidityRisk: number;
    behavioralRisk: number;
  };
  flags: string[];
  explanation: RiskExplanation;
  timestamp: string;
  analysisTimeMs: number;
}
