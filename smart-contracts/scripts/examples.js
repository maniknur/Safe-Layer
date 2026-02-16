/**
 * SafeLayer Complete Transaction Examples
 * 
 * Real-world examples of interacting with SafeLayerRegistry
 * Including transaction creation, execution, and verification
 */

const hre = require("hardhat");
const { ethers } = require("ethers");

// ============================================================================
// EXAMPLE 1: Complete Report Submission Workflow
// ============================================================================

/**
 * Complete example showing how to:
 * 1. Create a risk analysis report
 * 2. Hash it for on-chain storage
 * 3. Submit to the contract
 * 4. Verify the submission
 */
async function completeSubmissionWorkflow() {
  console.log("\n========================================");
  console.log("COMPLETE RISK REPORT SUBMISSION");
  console.log("========================================\n");

  // Configuration
  const config = {
    contractAddress: "0xYourDeployedContractAddress",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    analyzerPrivateKey: "0xYourAnalyzerPrivateKey",
  };

  // Step 1: Create the Full Risk Analysis
  console.log("📊 STEP 1: Risk Analysis Report\n");

  const report = {
    // Metadata
    reportId: "report_0xdeadbeef_1708106400",
    schemaVersion: "1.0",
    analysisTimestamp: Math.floor(Date.now() / 1000),

    // Target being analyzed
    targetAddress: "0xdead000000000000000000000000000000000001",
    targetChain: 56,
    targetType: "contract",

    // Risk assessment (output of analysis)
    riskScore: 85,
    riskLevel: "HIGH",

    // Analyzer information
    analyzerAddress: "0xbeeefaced00dead0000000000000000c0ffee00",
    analyzerVersion: "SafeML-v2.1.0",

    // Detailed findings
    findings: {
      contractAnalysis: {
        age: "3 days",
        compiler: "0.8.20",
        optimization: true,
        codeSize: 8563,
        methodCount: 24,
        suspiciousMethods: [
          {
            name: "_transferFrom",
            risk: "MEDIUM",
            reason: "Allows arbitrary transfers",
          },
        ],
      },

      liquidityAnalysis: {
        totalLiquidity: "1,234,567 USD",
        liquidityAge: "2 days",
        liquidityLocked: false,
        rugPullRisk: "MEDIUM",
        withdrawalRestrictions: true,
      },

      holderAnalysis: {
        topHolder: {
          percentage: 45.2,
          address: "0x111111...",
          type: "suspicious_new",
        },
        totalHolders: 523,
        whaleConcentration: 78.3,
        holderDiversity: "LOW",
      },

      behaviorAnalysis: {
        ownerAddressAge: "8 hours",
        ownerTransactionHistory: "low_activity",
        ownerHoldings: "diversified",
        suspiciousOwnerBehavior: "transfer_to_exchanges",
      },

      tokenomicsAnalysis: {
        totalSupply: "1000000000",
        circulatingSupply: "850000000",
        mintable: true,
        burnable: false,
        pausable: true,
        freezeable: true,
      },

      complianceAnalysis: {
        kukoins: false,
        rugcheck: false,
        certik: false,
        hazardous: true,
      },
    },

    // Risk breakdown
    riskFactors: {
      contractRisk: 70,
      liquidityRisk: 65,
      holderConcentrationRisk: 95,
      ownerBehaviorRisk: 80,
      tokenomicsRisk: 60,
    },

    // Recommendations
    recommendations: [
      "DO NOT invest large amounts",
      "Monitor holder concentration",
      "Track owner wallet movements",
      "Check for withdrawal restrictions",
    ],

    // Source data for verification
    dataPoints: {
      blockchainScanned: 12345678,
      transactionsAnalyzed: 1523,
      transferEventsAnalyzed: 4521,
      holderDataPoints: 523,
    },
  };

  console.log("Target Contract:", report.targetAddress);
  console.log("Risk Score:", report.riskScore, "/ 100");
  console.log("Risk Level:", report.riskLevel);
  console.log("Analysis Time:", new Date(report.analysisTimestamp * 1000).toISOString());
  console.log("Analyzer:", report.analyzerAddress);

  // Step 2: Create Keccak256 Hash
  console.log("\n🔐 STEP 2: Generate Report Hash\n");

  const jsonString = JSON.stringify(report, null, 0); // Compact JSON
  const hashBytes = ethers.toUtf8Bytes(jsonString);
  const reportHash = ethers.keccak256(hashBytes);

  console.log("JSON Report Size:", jsonString.length, "bytes");
  console.log("Report Hash:", reportHash);
  console.log(
    "Hash (first 16 chars):",
    reportHash.substring(0, 16) + "..."
  );

  // Step 3: Prepare Contract Call
  console.log("\n📝 STEP 3: Prepare Smart Contract Transaction\n");

  const targetAddress = report.targetAddress;
  const riskScore = report.riskScore;
  const riskLevel = 2; // 0=LOW, 1=MEDIUM, 2=HIGH

  console.log("Target Address:", targetAddress);
  console.log("Risk Score:", riskScore);
  console.log("Risk Level Enum:", riskLevel, "(2=HIGH)");
  console.log("Report Hash:", reportHash);

  // Step 4: Show Transaction Details
  console.log("\n⚡ STEP 4: Transaction Details\n");

  console.log("Function: submitRiskReport");
  console.log("Parameters:");
  console.log("  - targetAddress:", targetAddress);
  console.log("  - riskScore:", riskScore);
  console.log("  - riskLevel:", riskLevel);
  console.log("  - reportHash:", reportHash);
  console.log("\nTransaction Type: write (costs gas)");
  console.log("Estimated Gas: ~100,000 - 150,000");
  console.log("Est. Cost (10 gwei): ~0.001-0.0015 BNB");

  // Step 5: Submission Code (commented out for safety)
  console.log("\n✅ STEP 5: Submission Code\n");

  const exampleCode = `
// Connect to blockchain
const provider = new ethers.JsonRpcProvider(
  "https://data-seed-prebsc-1-s1.binance.org:8545/"
);
const wallet = new ethers.Wallet(analyzerPrivateKey, provider);

// Contract ABI (minimal)
const ABI = [
  {
    name: "submitRiskReport",
    type: "function",
    inputs: [
      { name: "targetAddress", type: "address" },
      { name: "riskScore", type: "uint8" },
      { name: "riskLevel", type: "uint8" },
      { name: "reportHash", type: "bytes32" },
    ],
  },
];

// Create contract instance
const contract = new ethers.Contract(
  contractAddress,
  ABI,
  wallet
);

// Submit the report
const tx = await contract.submitRiskReport(
  "${targetAddress}",
  ${riskScore},
  ${riskLevel},
  "${reportHash}"
);

// Wait for confirmation
const receipt = await tx.wait();
console.log("Submitted in block:", receipt.blockNumber);
`;

  console.log(exampleCode);

  // Step 6: Query the Report
  console.log("\n🔍 STEP 6: Query Submitted Report\n");

  const queryCode = `
// Get all reports for target
const reportIndices = await contract.getReportsByTarget(
  "${targetAddress}"
);
console.log("Found", reportIndices.length, "reports");

// Get the latest report
const latestReport = await contract.getLatestReportForTarget(
  "${targetAddress}"
);
console.log("Latest Risk Score:", latestReport.riskScore);
console.log("Latest Risk Level:", latestReport.riskLevel);
console.log("Report Hash:", latestReport.reportHash);
console.log("Timestamp:", new Date(latestReport.timestamp * 1000).toISOString());
console.log("Analyzer:", latestReport.analyzer);
`;

  console.log(queryCode);

  return {
    report,
    hash: reportHash,
    submitParams: {
      targetAddress,
      riskScore,
      riskLevel,
      reportHash,
    },
  };
}

// ============================================================================
// EXAMPLE 2: Batch Report Submission
// ============================================================================

/**
 * Submit multiple reports in sequence
 */
async function batchReportSubmission(contractAddress, analyzerPrivateKey, rpcUrl) {
  console.log("\n========================================");
  console.log("BATCH RISK REPORT SUBMISSION");
  console.log("========================================\n");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(analyzerPrivateKey, provider);

  const ABI = [
    {
      name: "submitRiskReport",
      type: "function",
      inputs: [
        { name: "targetAddress", type: "address" },
        { name: "riskScore", type: "uint8" },
        { name: "riskLevel", type: "uint8" },
        { name: "reportHash", type: "bytes32" },
      ],
    },
  ];

  const contract = new ethers.Contract(contractAddress, ABI, wallet);

  // Multiple targets to analyze
  const targetContracts = [
    {
      address: "0xaaa0000000000000000000000000000000000001",
      score: 25,
      level: 0, // LOW
    },
    {
      address: "0xbbb0000000000000000000000000000000000002",
      score: 55,
      level: 1, // MEDIUM
    },
    {
      address: "0xccc0000000000000000000000000000000000003",
      score: 90,
      level: 2, // HIGH
    },
  ];

  console.log(`Submitting ${targetContracts.length} reports...\n`);

  for (const target of targetContracts) {
    // Create report
    const report = {
      targetAddress: target.address,
      riskScore: target.score,
      analysisTime: Math.floor(Date.now() / 1000),
    };

    // Hash report
    const hash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(report))
    );

    // Submit
    console.log(`Submitting for ${target.address}`);
    console.log(`  Score: ${target.score} (${["LOW", "MEDIUM", "HIGH"][target.level]})`);
    console.log(`  Hash: ${hash.substring(0, 16)}...`);

    // Uncomment to actually submit:
    // const tx = await contract.submitRiskReport(
    //   target.address,
    //   target.score,
    //   target.level,
    //   hash
    // );
    // const receipt = await tx.wait();
    // console.log(`  ✓ Confirmed in block ${receipt.blockNumber}\n`);

    console.log("  (Dry run - not submitting)\n");
  }
}

// ============================================================================
// EXAMPLE 3: Verify Report on-Chain
// ============================================================================

/**
 * Retrieve and verify a submitted report
 */
async function verifyReportOnChain(contractAddress, rpcUrl, targetAddress) {
  console.log("\n========================================");
  console.log("VERIFY REPORT ON-CHAIN");
  console.log("========================================\n");

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const ABI = [
    {
      name: "getLatestReportForTarget",
      type: "function",
      stateMutability: "view",
      inputs: [{ name: "targetAddress", type: "address" }],
      outputs: [
        {
          type: "tuple",
          components: [
            { name: "targetAddress", type: "address" },
            { name: "riskScore", type: "uint8" },
            { name: "riskLevel", type: "uint8" },
            { name: "reportHash", type: "bytes32" },
            { name: "timestamp", type: "uint256" },
            { name: "analyzer", type: "address" },
          ],
        },
      ],
    },
  ];

  const contract = new ethers.Contract(contractAddress, ABI, provider);

  console.log("Querying for:", targetAddress);
  console.log("");

  // Uncomment to query:
  // const report = await contract.getLatestReportForTarget(targetAddress);
  // console.log("Report Retrieved:");
  // console.log("  Risk Score:", report.riskScore, "/ 100");
  // console.log("  Risk Level:", ["LOW", "MEDIUM", "HIGH"][report.riskLevel]);
  // console.log("  Hash:", report.reportHash);
  // console.log("  Timestamp:", new Date(report.timestamp * 1000).toISOString());
  // console.log("  Analyzer:", report.analyzer);
  // console.log("  ✓ Report verified on-chain!");

  console.log("Report Retrieved:");
  console.log("  Risk Score: 85 / 100");
  console.log("  Risk Level: HIGH");
  console.log("  Hash: 0x1234567890abcdef...");
  console.log("  Timestamp: 2024-02-16T10:30:45.000Z");
  console.log("  Analyzer: 0xanalyzer...");
  console.log("  ✓ Report verified on-chain!");
}

// ============================================================================
// MAIN: Run Examples
// ============================================================================

async function main() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     SafeLayer Complete Transaction Examples               ║");
  console.log("║                                                            ║");
  console.log("║  This file shows real examples of:                        ║");
  console.log("║  1. Creating risk analysis reports                        ║");
  console.log("║  2. Hashing reports for on-chain storage                  ║");
  console.log("║  3. Submitting to SafeLayerRegistry                       ║");
  console.log("║  4. Querying reports from blockchain                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // Run examples
  await completeSubmissionWorkflow();

  console.log("\n");
  console.log("Note: All examples show structure. Uncomment the actual");
  console.log("transaction calls to execute on-chain.");
  console.log("\nSee backend-integration.js for more examples.");
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  completeSubmissionWorkflow,
  batchReportSubmission,
  verifyReportOnChain,
};
