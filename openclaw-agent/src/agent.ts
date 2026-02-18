/**
 * SafeLayer Autonomous Agent Runner
 *
 * Standalone process that implements the OpenClaw agent lifecycle:
 *   OBSERVE → DECIDE → ACT
 *
 * Runs on a configurable cron schedule (default: every 2 minutes).
 * Each cycle:
 *   1. OBSERVE: Scan recent blocks for contract deployments + suspicious activity
 *   2. DECIDE:  Run 5-module risk engine, evaluate score against threshold
 *   3. ACT:     Submit proof on-chain, store alert, log AI disclosure
 *
 * Usage:
 *   npx ts-node src/agent.ts
 *   # or after build:
 *   node dist/agent.js
 */

import { ethers } from 'ethers';
import { AlertStore, type RiskAlert } from './services/alertStore';
import { ProofVerifier } from './services/proofVerifier';
import { DisclosureLog } from './services/disclosureLog';
import { startAlertServer } from './server';

// ─── Configuration ───
const RPC_URL = process.env.BNB_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const REGISTRY_ADDRESS = process.env.REGISTRY_CONTRACT_ADDRESS || '0x20B28a7b961a6d82222150905b0C01256607B5A3';
const ANALYZER_PRIVATE_KEY = process.env.ANALYZER_PRIVATE_KEY || '';
const BACKEND_URL = process.env.SAFELAYER_BACKEND_URL || 'http://localhost:3001';
const SUBMISSION_THRESHOLD = Number(process.env.RISK_SUBMISSION_THRESHOLD || '0');
const CYCLE_INTERVAL_MS = Number(process.env.CYCLE_INTERVAL_MS || '120000'); // 2 minutes
const BLOCKS_PER_CYCLE = Number(process.env.BLOCKS_PER_CYCLE || '40');
const ALERT_API_PORT = Number(process.env.ALERT_API_PORT || '3002');

const REGISTRY_ABI = [
  'function submitRiskReport(address targetAddress, uint8 riskScore, uint8 riskLevel, bytes32 reportHash) external',
  'function getLatestReportForTarget(address targetAddress) external view returns (tuple(address targetAddress, uint8 riskScore, uint8 riskLevel, bytes32 reportHash, uint256 timestamp, address analyzer))',
  'function getReportCountForTarget(address targetAddress) external view returns (uint256)',
  'function getTotalReports() external view returns (uint256)',
  'function approvedAnalyzers(address) external view returns (bool)',
  'event RiskReportSubmitted(address indexed targetAddress, uint8 riskScore, uint8 riskLevel, bytes32 indexed reportHash, address indexed analyzer, uint256 timestamp)',
] as const;

// ─── State ───
let lastProcessedBlock = 0;
let cycleCount = 0;
let provider: ethers.JsonRpcProvider;
let writeContract: ethers.Contract | null = null;
let readContract: ethers.Contract;
let analyzerAddress = '';

const alertStore = new AlertStore();
const proofVerifier = new ProofVerifier();
const disclosureLog = new DisclosureLog();

// ─── Helpers ───
function scoreToOnChainLevel(score: number): number {
  if (score <= 33) return 0;
  if (score <= 66) return 1;
  return 2;
}

function hashReport(report: object): string {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(report)));
}

function log(phase: string, msg: string): void {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${phase}] ${msg}`);
}

// ─── Initialization ───
function initialize(): void {
  provider = new ethers.JsonRpcProvider(RPC_URL);
  readContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);

  if (ANALYZER_PRIVATE_KEY) {
    const wallet = new ethers.Wallet(ANALYZER_PRIVATE_KEY, provider);
    analyzerAddress = wallet.address;
    writeContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet);
    log('INIT', `Analyzer wallet: ${analyzerAddress}`);
  } else {
    log('INIT', 'WARNING: No ANALYZER_PRIVATE_KEY — on-chain submission disabled');
  }

  log('INIT', `Registry: ${REGISTRY_ADDRESS}`);
  log('INIT', `Backend: ${BACKEND_URL}`);
  log('INIT', `Cycle interval: ${CYCLE_INTERVAL_MS / 1000}s`);
  log('INIT', `Blocks per cycle: ${BLOCKS_PER_CYCLE}`);
  log('INIT', `Submission threshold: ${SUBMISSION_THRESHOLD}`);
}

// ═══════════════════════════════════════════════════════════
//  PHASE 1: OBSERVE
//  Scan blocks for contract deployments and suspicious txs
// ═══════════════════════════════════════════════════════════

interface ObservedTarget {
  address: string;
  deployer: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  reason: 'contract_deployment' | 'large_value_transfer' | 'suspicious_pattern';
}

async function observe(): Promise<ObservedTarget[]> {
  const targets: ObservedTarget[] = [];
  const currentBlock = await provider.getBlockNumber();

  if (lastProcessedBlock === 0) {
    lastProcessedBlock = currentBlock - BLOCKS_PER_CYCLE;
  }

  const fromBlock = lastProcessedBlock + 1;
  const toBlock = Math.min(fromBlock + BLOCKS_PER_CYCLE - 1, currentBlock);

  if (fromBlock > currentBlock) {
    log('OBSERVE', `No new blocks (current: ${currentBlock})`);
    return targets;
  }

  log('OBSERVE', `Scanning blocks ${fromBlock}→${toBlock} (${toBlock - fromBlock + 1} blocks)`);

  for (let i = fromBlock; i <= toBlock; i++) {
    try {
      const block = await provider.getBlock(i, true);
      if (!block || !block.prefetchedTransactions) continue;

      for (const tx of block.prefetchedTransactions) {
        // 1. Contract creation (tx.to === null)
        if (tx.to === null) {
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (receipt?.contractAddress) {
            targets.push({
              address: receipt.contractAddress,
              deployer: tx.from,
              txHash: tx.hash,
              blockNumber: i,
              timestamp: block.timestamp,
              reason: 'contract_deployment',
            });
          }
        }

        // 2. Large value transfers (> 100 BNB) to contracts
        if (tx.to && tx.value > ethers.parseEther('100')) {
          const code = await provider.getCode(tx.to);
          if (code !== '0x') {
            targets.push({
              address: tx.to,
              deployer: tx.from,
              txHash: tx.hash,
              blockNumber: i,
              timestamp: block.timestamp,
              reason: 'large_value_transfer',
            });
          }
        }
      }
    } catch (err) {
      log('OBSERVE', `Block ${i} error: ${err instanceof Error ? err.message : err}`);
    }
  }

  lastProcessedBlock = toBlock;

  // Deduplicate by address
  const seen = new Set<string>();
  const unique = targets.filter((t) => {
    const key = t.address.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  log('OBSERVE', `Found ${unique.length} targets (${targets.length} raw events)`);
  return unique;
}

// ═══════════════════════════════════════════════════════════
//  PHASE 2: DECIDE
//  Run risk analysis, determine if on-chain submission needed
// ═══════════════════════════════════════════════════════════

interface AnalysisResult {
  address: string;
  riskScore: number;
  riskLevel: string;
  breakdown: {
    contract_risk: number;
    behavior_risk: number;
    reputation_risk: number;
  };
  keyFindings: string[];
  explanation: string;
  analysisTimeMs: number;
  shouldSubmit: boolean;
  skipReason?: string;
}

async function decide(targets: ObservedTarget[]): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];

  for (const target of targets) {
    try {
      // Check if already analyzed recently
      const reportCount = await readContract
        .getReportCountForTarget(target.address)
        .then(Number)
        .catch(() => 0);

      if (reportCount > 0) {
        const latest = await readContract.getLatestReportForTarget(target.address);
        const lastAnalyzedAt = Number(latest.timestamp) * 1000;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

        if (lastAnalyzedAt > fiveMinutesAgo) {
          log('DECIDE', `Skip ${target.address} — analyzed ${Math.round((Date.now() - lastAnalyzedAt) / 1000)}s ago`);
          results.push({
            address: target.address,
            riskScore: Number(latest.riskScore),
            riskLevel: ['LOW', 'MEDIUM', 'HIGH'][Number(latest.riskLevel)] || 'UNKNOWN',
            breakdown: { contract_risk: 0, behavior_risk: 0, reputation_risk: 0 },
            keyFindings: [],
            explanation: 'Skipped — recently analyzed',
            analysisTimeMs: 0,
            shouldSubmit: false,
            skipReason: 'recently_analyzed',
          });
          continue;
        }
      }

      // Call SafeLayer backend for full analysis
      log('DECIDE', `Analyzing ${target.address} (reason: ${target.reason})...`);

      const response = await fetch(
        `${BACKEND_URL}/api/risk/${target.address.toLowerCase()}`,
        { signal: AbortSignal.timeout(60_000) }
      );

      if (!response.ok) {
        log('DECIDE', `Backend error for ${target.address}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();

      const shouldSubmit =
        data.riskScore >= SUBMISSION_THRESHOLD && writeContract !== null;

      results.push({
        address: data.address,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        breakdown: data.breakdown || { contract_risk: 0, behavior_risk: 0, reputation_risk: 0 },
        keyFindings: data.explanation?.keyFindings || [],
        explanation: data.explanation?.summary || '',
        analysisTimeMs: data.analysisTimeMs || 0,
        shouldSubmit,
        skipReason: !shouldSubmit
          ? writeContract
            ? `score ${data.riskScore} < threshold ${SUBMISSION_THRESHOLD}`
            : 'no_private_key'
          : undefined,
      });

      log('DECIDE', `${target.address}: score=${data.riskScore} level=${data.riskLevel} submit=${shouldSubmit}`);
    } catch (err) {
      log('DECIDE', `Error analyzing ${target.address}: ${err instanceof Error ? err.message : err}`);
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
//  PHASE 3: ACT
//  Submit on-chain, store alert, log disclosure
// ═══════════════════════════════════════════════════════════

interface ActResult {
  address: string;
  riskScore: number;
  riskLevel: string;
  txHash: string | null;
  blockNumber: number | null;
  gasUsed: string | null;
  reportHash: string;
  explorerUrl: string | null;
  error?: string;
}

async function act(analyses: AnalysisResult[]): Promise<ActResult[]> {
  const results: ActResult[] = [];

  for (const analysis of analyses) {
    if (!analysis.shouldSubmit) {
      log('ACT', `Skip ${analysis.address}: ${analysis.skipReason}`);
      continue;
    }

    // Build report data (matches backend schema exactly)
    const reportData = {
      address: analysis.address.toLowerCase(),
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      breakdown: analysis.breakdown,
      timestamp: new Date().toISOString(),
      schemaVersion: '2.0' as const,
    };

    const reportHash = hashReport(reportData);
    const onChainLevel = scoreToOnChainLevel(analysis.riskScore);

    try {
      log('ACT', `Submitting ${analysis.address} (score=${analysis.riskScore})...`);

      const tx = await writeContract!.submitRiskReport(
        analysis.address,
        analysis.riskScore,
        onChainLevel,
        reportHash
      );

      const receipt = await tx.wait();

      const explorerUrl = `https://testnet.bscscan.com/tx/${receipt.hash}`;

      log('ACT', `Submitted: tx=${receipt.hash} block=${receipt.blockNumber} gas=${receipt.gasUsed}`);
      log('ACT', `Explorer: ${explorerUrl}`);

      const actResult: ActResult = {
        address: analysis.address,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        txHash: receipt.hash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
        reportHash,
        explorerUrl,
      };

      results.push(actResult);

      // Store alert
      const alert: RiskAlert = {
        id: `alert-${Date.now()}-${analysis.address.slice(0, 8)}`,
        address: analysis.address,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        confidenceLevel: analysis.riskScore >= 80 ? 'high' : analysis.riskScore >= 50 ? 'medium' : 'low',
        txHash: receipt.hash,
        reportHash,
        blockNumber: Number(receipt.blockNumber),
        timestamp: new Date().toISOString(),
        keyFindings: analysis.keyFindings,
        breakdown: analysis.breakdown,
        explorerUrl,
      };
      alertStore.add(alert);

      // Log AI disclosure
      disclosureLog.log({
        cycleId: cycleCount,
        address: analysis.address,
        action: 'onchain_submission',
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        txHash: receipt.hash,
        reportHash,
        modelUsed: 'SafeLayer Risk Intelligence Engine v2.0',
        analyzersUsed: [
          'ContractAnalyzer',
          'BehaviorAnalyzer',
          'WalletHistoryChecker',
          'TransparencyChecker',
          'ScamDatabaseChecker',
        ],
        scoringFormula: 'Risk = (Contract×0.40) + (Behavior×0.40) + (Reputation×0.20)',
        autonomous: true,
        timestamp: new Date().toISOString(),
      });

      // Verify proof immediately
      const verified = await proofVerifier.verify(analysis.address, reportData, reportHash);
      if (verified) {
        log('ACT', `Proof verified on-chain for ${analysis.address}`);
      } else {
        log('ACT', `WARNING: Proof verification pending for ${analysis.address}`);
      }
    } catch (err) {
      const message = err instanceof Error
        ? (err as { reason?: string }).reason || err.message
        : 'Unknown error';

      log('ACT', `ERROR submitting ${analysis.address}: ${message}`);

      results.push({
        address: analysis.address,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        txHash: null,
        blockNumber: null,
        gasUsed: null,
        reportHash,
        explorerUrl: null,
        error: message,
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
//  MAIN CYCLE: OBSERVE → DECIDE → ACT
// ═══════════════════════════════════════════════════════════

async function runCycle(): Promise<void> {
  cycleCount++;
  const cycleStart = Date.now();

  log('CYCLE', `═══ Cycle #${cycleCount} started ═══`);

  try {
    // OBSERVE
    const targets = await observe();

    if (targets.length === 0) {
      log('CYCLE', `No targets found. Cycle #${cycleCount} complete (${Date.now() - cycleStart}ms)`);
      return;
    }

    // DECIDE
    const analyses = await decide(targets);
    const toSubmit = analyses.filter((a) => a.shouldSubmit);

    log('CYCLE', `Analyzed: ${analyses.length} | To submit: ${toSubmit.length}`);

    // ACT
    const results = await act(analyses);

    // Cycle summary
    const submitted = results.filter((r) => r.txHash);
    const failed = results.filter((r) => r.error);

    log('CYCLE', `═══ Cycle #${cycleCount} complete ═══`);
    log('CYCLE', `Duration: ${Date.now() - cycleStart}ms`);
    log('CYCLE', `Targets: ${targets.length} | Analyzed: ${analyses.length} | Submitted: ${submitted.length} | Failed: ${failed.length}`);

    for (const r of submitted) {
      log('RESULT', `${r.address} → Score: ${r.riskScore}/100 (${r.riskLevel}) | TX: ${r.txHash} | ${r.explorerUrl}`);
    }

    for (const r of failed) {
      log('RESULT', `${r.address} → FAILED: ${r.error}`);
    }
  } catch (err) {
    log('CYCLE', `FATAL: ${err instanceof Error ? err.message : err}`);
  }
}

// ═══════════════════════════════════════════════════════════
//  ENTRY POINT
// ═══════════════════════════════════════════════════════════

async function main(): Promise<void> {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║  SafeLayer Risk Sentinel — Autonomous Agent     ║');
  console.log('  ║  OpenClaw Edition · BNB Chain                   ║');
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log('');

  initialize();

  // Start alert API server
  startAlertServer(alertStore, disclosureLog, proofVerifier, ALERT_API_PORT);

  // Run first cycle immediately
  log('MAIN', `Running first cycle...`);
  await runCycle();

  // Schedule recurring cycles
  log('MAIN', `Scheduling cycles every ${CYCLE_INTERVAL_MS / 1000}s`);

  const interval = setInterval(() => {
    runCycle().catch((err) => {
      log('MAIN', `Cycle error: ${err instanceof Error ? err.message : err}`);
    });
  }, CYCLE_INTERVAL_MS);

  // Graceful shutdown
  const shutdown = () => {
    log('MAIN', 'Shutting down...');
    clearInterval(interval);
    log('MAIN', `Total cycles: ${cycleCount} | Total alerts: ${alertStore.count()}`);
    disclosureLog.flush();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  log('MAIN', 'Agent running. Press Ctrl+C to stop.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
