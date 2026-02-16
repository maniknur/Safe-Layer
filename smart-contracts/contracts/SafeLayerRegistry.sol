// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title SafeLayerRegistry
 * @notice Immutable on-chain registry for off-chain risk analysis proofs
 * @dev Stores hashed risk reports submitted by approved analyzers only
 *
 * Security Model:
 * - Only APPROVED analyzers can submit risk reports (onlyAnalyzer)
 * - Only OWNER can approve/remove analyzers (onlyOwner via Ownable2Step)
 * - 2-step ownership transfer prevents accidental loss of control
 * - All writes are restricted - prevents data manipulation
 *
 * Gas Optimizations:
 * - Custom errors instead of require strings (~200 gas saved per revert)
 * - Struct packing: address(20)+uint8(1)+enum(1) = 22 bytes in 1 slot
 * - Batch submit: multiple reports in 1 tx saves ~21000 base gas per extra report
 * - unchecked loop increment
 * - storage pointer in getLatestReportForTarget (avoids memory copy)
 * - Optimizer enabled at 200 runs
 */
contract SafeLayerRegistry is Ownable2Step {

    // ============== CUSTOM ERRORS (gas-efficient vs require strings) ==============

    error NotAnalyzer();
    error ZeroAddress();
    error AlreadyApproved();
    error NotApproved();
    error ScoreOutOfRange();
    error EmptyReportHash();
    error RiskLevelMismatch();
    error ReportIndexOutOfBounds();
    error NoReportsForTarget();
    error EmptyBatch();
    error BatchTooLarge();
    error ArrayLengthMismatch();

    // ============== CONSTANTS ==============

    uint8 private constant MAX_RISK_SCORE = 100;
    uint8 private constant MAX_BATCH_SIZE = 50;

    // ============== TYPES ==============

    enum RiskLevel {
        LOW,      // 0-33
        MEDIUM,   // 34-66
        HIGH      // 67-100
    }

    /// @notice Struct representing a single risk report
    /// @dev Packed: targetAddress(20) + riskScore(1) + riskLevel(1) = 22 bytes → slot 1
    struct RiskReport {
        address targetAddress;
        uint8 riskScore;
        RiskLevel riskLevel;
        bytes32 reportHash;
        uint256 timestamp;
        address analyzer;
    }

    // ============== STATE ==============

    RiskReport[] private reports;
    mapping(address => uint256[]) private reportsByTarget;
    mapping(address => bool) public approvedAnalyzers;

    // ============== EVENTS ==============

    event RiskReportSubmitted(
        address indexed targetAddress,
        uint8 riskScore,
        RiskLevel riskLevel,
        bytes32 indexed reportHash,
        address indexed analyzer,
        uint256 timestamp
    );

    event AnalyzerApproved(address indexed analyzer);
    event AnalyzerRemoved(address indexed analyzer);

    // ============== MODIFIERS ==============

    modifier onlyAnalyzer() {
        if (!approvedAnalyzers[msg.sender]) revert NotAnalyzer();
        _;
    }

    // ============== CONSTRUCTOR ==============

    /// @notice Deployer becomes owner + first approved analyzer
    constructor() {
        approvedAnalyzers[msg.sender] = true;
        emit AnalyzerApproved(msg.sender);
    }

    // ============== ADMIN FUNCTIONS ==============

    /// @notice Approve an analyzer address to submit risk reports
    /// @param analyzer The address to approve
    function approveAnalyzer(address analyzer) external onlyOwner {
        if (analyzer == address(0)) revert ZeroAddress();
        if (approvedAnalyzers[analyzer]) revert AlreadyApproved();

        approvedAnalyzers[analyzer] = true;
        emit AnalyzerApproved(analyzer);
    }

    /// @notice Remove approval from an analyzer address
    /// @param analyzer The address to revoke
    function removeAnalyzer(address analyzer) external onlyOwner {
        if (!approvedAnalyzers[analyzer]) revert NotApproved();

        approvedAnalyzers[analyzer] = false;
        emit AnalyzerRemoved(analyzer);
    }

    // ============== CORE FUNCTIONS ==============

    /// @notice Submit a single risk report
    /// @param targetAddress The address being analyzed
    /// @param riskScore Numerical risk score (0-100)
    /// @param riskLevel Categorical risk level (must match score range)
    /// @param reportHash Keccak256 hash of full JSON report
    function submitRiskReport(
        address targetAddress,
        uint8 riskScore,
        RiskLevel riskLevel,
        bytes32 reportHash
    ) external onlyAnalyzer {
        _submitReport(targetAddress, riskScore, riskLevel, reportHash);
    }

    /// @notice Submit multiple risk reports in a single transaction
    /// @dev Saves ~21000 base gas per additional report vs separate txs
    /// @param targetAddresses Array of addresses being analyzed
    /// @param riskScores Array of risk scores (0-100)
    /// @param riskLevels Array of risk levels
    /// @param reportHashes Array of report hashes
    function submitBatchReports(
        address[] calldata targetAddresses,
        uint8[] calldata riskScores,
        RiskLevel[] calldata riskLevels,
        bytes32[] calldata reportHashes
    ) external onlyAnalyzer {
        uint256 len = targetAddresses.length;
        if (len == 0) revert EmptyBatch();
        if (len > MAX_BATCH_SIZE) revert BatchTooLarge();
        if (len != riskScores.length || len != riskLevels.length || len != reportHashes.length)
            revert ArrayLengthMismatch();

        for (uint256 i; i < len;) {
            _submitReport(targetAddresses[i], riskScores[i], riskLevels[i], reportHashes[i]);
            unchecked { ++i; }
        }
    }

    /// @dev Internal: validates inputs and stores a single report
    function _submitReport(
        address targetAddress,
        uint8 riskScore,
        RiskLevel riskLevel,
        bytes32 reportHash
    ) internal {
        if (targetAddress == address(0)) revert ZeroAddress();
        if (riskScore > MAX_RISK_SCORE) revert ScoreOutOfRange();
        if (reportHash == bytes32(0)) revert EmptyReportHash();

        // Validate risk level matches score range
        if (riskScore <= 33) {
            if (riskLevel != RiskLevel.LOW) revert RiskLevelMismatch();
        } else if (riskScore <= 66) {
            if (riskLevel != RiskLevel.MEDIUM) revert RiskLevelMismatch();
        } else {
            if (riskLevel != RiskLevel.HIGH) revert RiskLevelMismatch();
        }

        uint256 reportIndex = reports.length;
        reports.push(RiskReport({
            targetAddress: targetAddress,
            riskScore: riskScore,
            riskLevel: riskLevel,
            reportHash: reportHash,
            timestamp: block.timestamp,
            analyzer: msg.sender
        }));

        reportsByTarget[targetAddress].push(reportIndex);

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
    function getReport(uint256 reportIndex) external view returns (RiskReport memory) {
        if (reportIndex >= reports.length) revert ReportIndexOutOfBounds();
        return reports[reportIndex];
    }

    /// @notice Get all report indices for a target address
    function getReportsByTarget(address targetAddress) external view returns (uint256[] memory) {
        return reportsByTarget[targetAddress];
    }

    /// @notice Get total number of reports in the registry
    function getTotalReports() external view returns (uint256) {
        return reports.length;
    }

    /// @notice Get the latest report for a target address
    /// @dev Uses storage pointer to avoid copying full array to memory
    function getLatestReportForTarget(address targetAddress) external view returns (RiskReport memory) {
        uint256[] storage indices = reportsByTarget[targetAddress];
        if (indices.length == 0) revert NoReportsForTarget();
        return reports[indices[indices.length - 1]];
    }

    /// @notice Get count of reports for a target address
    function getReportCountForTarget(address targetAddress) external view returns (uint256) {
        return reportsByTarget[targetAddress].length;
    }
}
