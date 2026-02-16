/**
 * SafeLayer Backend Integration Examples
 * 
 * This file demonstrates how to:
 * 1. Hash risk reports (backend side)
 * 2. Submit reports to the SafeLayerRegistry contract
 * 3. Query reports from the contract
 */

const { ethers } = require("ethers");

// ============================================================================
// EXAMPLE 1: Hash a Risk Report (Backend)
// ============================================================================

/**
 * Generate a keccak256 hash of a risk report object
 * This is used to create the proof that gets stored on-chain
 * 
 * @param {Object} report - Risk report object
 * @returns {String} Keccak256 hash (0x prefixed hex string)
 */
function hashRiskReport(report) {
  // Convert report object to JSON string
  const jsonString = JSON.stringify(report);
  
  // Hash using ethers.js keccak256
  const hash = ethers.keccak256(ethers.toUtf8Bytes(jsonString));
  
  return hash;
}

/**
 * Example: Generate and hash a complete risk report
 */
function exampleGenerateReport() {
  const report = {
    // Target being analyzed
    targetAddress: "0x1234567890123456789012345678901234567890",
    
    // Risk analysis results
    riskScore: 75,
    riskLevel: "HIGH",
    
    // Analysis metadata
    analysisTimestamp: Math.floor(Date.now() / 1000),
    analyzerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    
    // Detailed findings
    findings: {
      contractAge: "2 days",
      ownerBehavior: "high transfer frequency",
      liquidityRisk: "low",
      honeypotDetected: false,
      rugPullRisk: "MEDIUM",
    },
    
    // Supporting data
    metrics: {
      totalHolders: 523,
      contractCodeSize: 5248,
      methodCount: 12,
      suspiciousMethodsFound: 1,
    },
    
    // Analysis version
    schemaVersion: "1.0",
    reportId: "report_0x123456_${Date.now()}",
  };

  // Generate hash
  const hash = hashRiskReport(report);

  console.log("Risk Report:");
  console.log(JSON.stringify(report, null, 2));
  console.log("\nReport Hash (for on-chain proof):");
  console.log(hash);

  return { report, hash };
}

// ============================================================================
// EXAMPLE 2: Submit Report to Registry Contract
// ============================================================================

/**
 * Submit a hashed risk report to the SafeLayerRegistry contract
 * 
 * @param {String} contractAddress - Deployed SafeLayerRegistry address
 * @param {String} rpcUrl - BNB Chain RPC endpoint
 * @param {String} privateKey - Backend analyzer private key
 * @param {Object} params - Report parameters
 * @returns {Object} Transaction receipt
 */
async function submitRiskReportToContract(
  contractAddress,
  rpcUrl,
  privateKey,
  params
) {
  // params structure:
  // {
  //   targetAddress: "0x...",
  //   riskScore: 75,
  //   riskLevel: 2,  // 0=LOW, 1=MEDIUM, 2=HIGH
  //   reportHash: "0x..."
  // }

  // Connect to blockchain
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Contract ABI (minimal for this operation)
  const ABI = [
    {
      name: "submitRiskReport",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "targetAddress", type: "address" },
        { name: "riskScore", type: "uint8" },
        { name: "riskLevel", type: "uint8" },
        { name: "reportHash", type: "bytes32" },
      ],
      outputs: [],
    },
  ];

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, ABI, wallet);

  try {
    console.log("Submitting risk report to contract...");
    console.log(`Target Address: ${params.targetAddress}`);
    console.log(`Risk Score: ${params.riskScore}`);
    console.log(`Risk Level: ${params.riskLevel}`);
    console.log(`Report Hash: ${params.reportHash}`);

    // Submit transaction
    const tx = await contract.submitRiskReport(
      params.targetAddress,
      params.riskScore,
      params.riskLevel,
      params.reportHash
    );

    console.log("Transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed!");
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());

    return receipt;
  } catch (error) {
    console.error("Error submitting report:", error.message);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Query Reports from Contract
// ============================================================================

/**
 * Get all reports for a target address
 * 
 * @param {String} contractAddress - Deployed SafeLayerRegistry address
 * @param {String} rpcUrl - BNB Chain RPC endpoint
 * @param {String} targetAddress - Address to query
 * @returns {Array} Array of report indices
 */
async function getReportsForTarget(
  contractAddress,
  rpcUrl,
  targetAddress
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const ABI = [
    {
      name: "getReportsByTarget",
      type: "function",
      stateMutability: "view",
      inputs: [{ name: "targetAddress", type: "address" }],
      outputs: [{ type: "uint256[]" }],
    },
    {
      name: "getReport",
      type: "function",
      stateMutability: "view",
      inputs: [{ name: "reportIndex", type: "uint256" }],
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

  try {
    // Get all report indices for target
    const reportIndices = await contract.getReportsByTarget(targetAddress);
    console.log(`\nFound ${reportIndices.length} reports for ${targetAddress}`);

    // Fetch details for each report
    const reports = [];
    for (const index of reportIndices) {
      const report = await contract.getReport(index);
      reports.push({
        index: index.toString(),
        targetAddress: report.targetAddress,
        riskScore: report.riskScore,
        riskLevel: ["LOW", "MEDIUM", "HIGH"][report.riskLevel],
        reportHash: report.reportHash,
        timestamp: new Date(Number(report.timestamp) * 1000).toISOString(),
        analyzer: report.analyzer,
      });
    }

    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error.message);
    throw error;
  }
}

/**
 * Get the latest report for a target address
 * 
 * @param {String} contractAddress - Deployed SafeLayerRegistry address
 * @param {String} rpcUrl - BNB Chain RPC endpoint
 * @param {String} targetAddress - Address to query
 * @returns {Object} Latest RiskReport
 */
async function getLatestReportForTarget(
  contractAddress,
  rpcUrl,
  targetAddress
) {
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

  try {
    const report = await contract.getLatestReportForTarget(targetAddress);
    return {
      targetAddress: report.targetAddress,
      riskScore: report.riskScore,
      riskLevel: ["LOW", "MEDIUM", "HIGH"][report.riskLevel],
      reportHash: report.reportHash,
      timestamp: new Date(Number(report.timestamp) * 1000).toISOString(),
      analyzer: report.analyzer,
    };
  } catch (error) {
    console.error("Error fetching latest report:", error.message);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Complete Workflow
// ============================================================================

/**
 * Complete example: Analyze → Hash → Submit → Query
 */
async function completeWorkflow() {
  console.log("========================================");
  console.log("SafeLayer Risk Report Workflow");
  console.log("========================================\n");

  // Configuration
  const config = {
    contractAddress: "0xYourContractAddressHere",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    privateKey: "0xYourAnalyzerPrivateKeyHere",
  };

  // Step 1: Generate and hash a report
  console.log("Step 1: Generate Risk Report");
  console.log("-----------------------------");
  const { report, hash } = exampleGenerateReport();

  // Step 2: Submit to contract
  console.log("\n\nStep 2: Submit to SmartContract");
  console.log("-------------------------------");
  
  const submitParams = {
    targetAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    riskScore: 75,
    riskLevel: 2, // HIGH
    reportHash: hash,
  };

  // Uncomment to actually submit:
  // const receipt = await submitRiskReportToContract(
  //   config.contractAddress,
  //   config.rpcUrl,
  //   config.privateKey,
  //   submitParams
  // );

  // Step 3: Query reports
  console.log("\n\nStep 3: Query Reports");
  console.log("---------------------");
  
  // Uncomment to actually query:
  // const reports = await getReportsForTarget(
  //   config.contractAddress,
  //   config.rpcUrl,
  //   submitParams.targetAddress
  // );
  // console.log(JSON.stringify(reports, null, 2));
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  hashRiskReport,
  exampleGenerateReport,
  submitRiskReportToContract,
  getReportsForTarget,
  getLatestReportForTarget,
  completeWorkflow,
};

// ============================================================================
// TESTING
// ============================================================================

// Uncomment to test locally:
// exampleGenerateReport();
// completeWorkflow();
