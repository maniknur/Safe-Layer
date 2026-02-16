// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SafeLayerRegistry
 * @notice Immutable on-chain registry for off-chain risk analysis proofs
 * @dev Stores hashed risk reports submitted by approved analyzers
 * 
 * This contract acts as a proof registry for SafeLayer's Web3 security analysis.
 * It does NOT calculate risk - it only stores immutable cryptographic proofs
 * of risk analysis performed off-chain.
 */

contract SafeLayerRegistry {
    
    /// @notice Maximum possible risk score
    uint8 private constant MAX_RISK_SCORE = 100;
    
    /// @notice Enumeration for risk levels
    enum RiskLevel {
        LOW,      // 0-33
        MEDIUM,   // 34-66
        HIGH      // 67-100
    }
    
    /// @notice Struct representing a single risk report
    struct RiskReport {
        address targetAddress;      // Address being analyzed
        uint8 riskScore;            // Risk score 0-100
        RiskLevel riskLevel;        // Categorical risk level
        bytes32 reportHash;         // Keccak256 hash of full JSON report
        uint256 timestamp;          // Submission timestamp (block.timestamp)
        address analyzer;           // Address of approved analyzer that submitted
    }
    
    /// @notice All reports submitted to the registry (private)
    RiskReport[] private reports;
    
    /// @notice Mapping: target address => array of report indices
    /// Allows efficient lookup of all reports for a specific address
    mapping(address => uint256[]) private reportsByTarget;
    
    /// @notice Mapping: approved analyzer addresses
    mapping(address => bool) public approvedAnalyzers;
    
    /// @notice Contract owner address
    address public owner;
    
    /// @notice Event: Emitted when a new risk report is submitted
    /// @param targetAddress The address analyzed
    /// @param riskScore The numerical risk score
    /// @param riskLevel The categorical risk level
    /// @param reportHash The keccak256 hash of the full report
    /// @param analyzer The analyzer address that submitted the report
    /// @param timestamp The block timestamp of submission
    event RiskReportSubmitted(
        address indexed targetAddress,
        uint8 riskScore,
        RiskLevel riskLevel,
        bytes32 indexed reportHash,
        address indexed analyzer,
        uint256 timestamp
    );
    
    /// @notice Event: Emitted when an analyzer is approved
    event AnalyzerApproved(address indexed analyzer);
    
    /// @notice Event: Emitted when an analyzer is removed
    event AnalyzerRemoved(address indexed analyzer);
    
    /// @notice Modifier: Restrict function to contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "SafeLayerRegistry: Only owner can call this function");
        _;
    }
    
    /// @notice Modifier: Restrict function to approved analyzers
    modifier onlyAnalyzer() {
        require(approvedAnalyzers[msg.sender], "SafeLayerRegistry: Only approved analyzers can submit reports");
        _;
    }
    
    /// @notice Constructor: Initialize contract owner
    constructor() {
        owner = msg.sender;
        approvedAnalyzers[msg.sender] = true;
    }
    
    // ============== ADMIN FUNCTIONS ==============
    
    /// @notice Approve an analyzer address to submit reports
    /// @param analyzerAddress The address to approve
    /// @dev Only callable by contract owner
    function approveAnalyzer(address analyzerAddress) external onlyOwner {
        require(analyzerAddress != address(0), "SafeLayerRegistry: Cannot approve zero address");
        require(!approvedAnalyzers[analyzerAddress], "SafeLayerRegistry: Analyzer already approved");
        
        approvedAnalyzers[analyzerAddress] = true;
        emit AnalyzerApproved(analyzerAddress);
    }
    
    /// @notice Remove approval from an analyzer address
    /// @param analyzerAddress The address to remove
    /// @dev Only callable by contract owner
    function removeAnalyzer(address analyzerAddress) external onlyOwner {
        require(approvedAnalyzers[analyzerAddress], "SafeLayerRegistry: Analyzer not approved");
        
        approvedAnalyzers[analyzerAddress] = false;
        emit AnalyzerRemoved(analyzerAddress);
    }
    
    // ============== CORE FUNCTIONS ==============
    
    /// @notice Submit a risk report to the registry
    /// @param targetAddress The address being analyzed
    /// @param riskScore Numerical risk score (0-100)
    /// @param riskLevel Categorical risk level
    /// @param reportHash Keccak256 hash of full JSON report
    /// @dev Only approved analyzers can submit
    /// @dev Validates inputs before storing
    function submitRiskReport(
        address targetAddress,
        uint8 riskScore,
        RiskLevel riskLevel,
        bytes32 reportHash
    ) external onlyAnalyzer {
        // Validation: non-zero target address
        require(targetAddress != address(0), "SafeLayerRegistry: Target address cannot be zero");
        
        // Validation: risk score must be 0-100
        require(riskScore <= MAX_RISK_SCORE, "SafeLayerRegistry: Risk score must be <= 100");
        
        // Validation: non-zero report hash
        require(reportHash != bytes32(0), "SafeLayerRegistry: Report hash cannot be zero");
        
        // Validate risk level matches risk score range
        if (riskScore <= 33) {
            require(riskLevel == RiskLevel.LOW, "SafeLayerRegistry: Risk level mismatch (LOW: 0-33)");
        } else if (riskScore <= 66) {
            require(riskLevel == RiskLevel.MEDIUM, "SafeLayerRegistry: Risk level mismatch (MEDIUM: 34-66)");
        } else {
            require(riskLevel == RiskLevel.HIGH, "SafeLayerRegistry: Risk level mismatch (HIGH: 67-100)");
        }
        
        // Create and store the report
        uint256 reportIndex = reports.length;
        reports.push(
            RiskReport({
                targetAddress: targetAddress,
                riskScore: riskScore,
                riskLevel: riskLevel,
                reportHash: reportHash,
                timestamp: block.timestamp,
                analyzer: msg.sender
            })
        );
        
        // Index by target address for efficient lookup
        reportsByTarget[targetAddress].push(reportIndex);
        
        // Emit submission event
        emit RiskReportSubmitted(
            targetAddress,
            riskScore,
            riskLevel,
            reportHash,
            msg.sender,
            block.timestamp
        );
    }
    
    // ============== QUERY FUNCTIONS ==============
    
    /// @notice Get a specific report by index
    /// @param reportIndex The index of the report
    /// @return The RiskReport struct
    /// @dev Panics with out-of-bounds index
    function getReport(uint256 reportIndex) external view returns (RiskReport memory) {
        require(reportIndex < reports.length, "SafeLayerRegistry: Report index out of bounds");
        return reports[reportIndex];
    }
    
    /// @notice Get all report indices for a target address
    /// @param targetAddress The address to query
    /// @return Array of report indices
    function getReportsByTarget(address targetAddress) external view returns (uint256[] memory) {
        return reportsByTarget[targetAddress];
    }
    
    /// @notice Get total number of reports in the registry
    /// @return Total count of all reports
    function getTotalReports() external view returns (uint256) {
        return reports.length;
    }
    
    /// @notice Get the latest report for a target address
    /// @param targetAddress The address to query
    /// @return The most recent RiskReport for the target
    /// @dev Reverts if no reports exist for the target
    function getLatestReportForTarget(address targetAddress) external view returns (RiskReport memory) {
        uint256[] memory indices = reportsByTarget[targetAddress];
        require(indices.length > 0, "SafeLayerRegistry: No reports found for target");
        
        uint256 latestIndex = indices[indices.length - 1];
        return reports[latestIndex];
    }
    
    /// @notice Get count of reports for a target address
    /// @param targetAddress The address to query
    /// @return Number of reports for the target
    function getReportCountForTarget(address targetAddress) external view returns (uint256) {
        return reportsByTarget[targetAddress].length;
    }
    
    /// @notice Check if an analyzer is approved
    /// @param analyzerAddress The address to check
    /// @return True if approved, false otherwise
    function isAnalyzerApproved(address analyzerAddress) external view returns (bool) {
        return approvedAnalyzers[analyzerAddress];
    }
}
