# SafeLayer Risk Sentinel — OpenClaw Autonomous Agent

> Autonomous AI agent that monitors BNB Chain, performs real-time risk analysis with 5 parallel AI analyzers, and submits immutable proof on-chain.

**Good Vibes Only: OpenClaw Edition** hackathon submission.

---

## What It Does

SafeLayer Risk Sentinel is an **autonomous onchain risk intelligence agent** that:

1. **Monitors** BNB Chain every 2 minutes for new contract deployments
2. **Detects** suspicious activity (large transfers, new contracts)
3. **Analyzes** each target with 5 parallel AI risk analyzers
4. **Decides** autonomously whether to submit on-chain (no human input)
5. **Hashes** the structured risk report (keccak256)
6. **Submits** `riskScore + reportHash` to SafeLayerRegistry smart contract
7. **Emits** `RiskReportSubmitted` event on-chain
8. **Logs** transaction hash with BscScan link
9. **Exposes** real-time alert API at port 3002
10. **Records** every AI decision in a disclosure log

---

## Architecture

```
  ╔══════════════════════════════════════════════════════════════╗
  ║                 OpenClaw Agent Runtime                       ║
  ║                                                              ║
  ║  ┌─────────────────────────────────────────────────────────┐ ║
  ║  │                OBSERVE (every 2 min)                    │ ║
  ║  │  Scan BNB Chain blocks for:                             │ ║
  ║  │  • Contract deployments (tx.to === null)                │ ║
  ║  │  • Large value transfers (>100 BNB to contracts)        │ ║
  ║  └──────────────────────┬──────────────────────────────────┘ ║
  ║                         │                                    ║
  ║                         ▼                                    ║
  ║  ┌─────────────────────────────────────────────────────────┐ ║
  ║  │                   DECIDE                                │ ║
  ║  │  For each target:                                       │ ║
  ║  │  1. Check registry (skip if recent)                     │ ║
  ║  │  2. Call SafeLayer Risk Engine (5 parallel analyzers)   │ ║
  ║  │     ├── ContractAnalyzer (40%)                          │ ║
  ║  │     ├── BehaviorAnalyzer (40%)                          │ ║
  ║  │     ├── WalletHistoryChecker                            │ ║
  ║  │     ├── TransparencyChecker (20%)                       │ ║
  ║  │     └── ScamDatabaseChecker                             │ ║
  ║  │  3. Evaluate score vs threshold                         │ ║
  ║  └──────────────────────┬──────────────────────────────────┘ ║
  ║                         │                                    ║
  ║                         ▼                                    ║
  ║  ┌─────────────────────────────────────────────────────────┐ ║
  ║  │                    ACT                                  │ ║
  ║  │  1. Build report data (JSON)                            │ ║
  ║  │  2. Hash: keccak256(JSON.stringify(report))             │ ║
  ║  │  3. Submit: submitRiskReport(addr, score, level, hash)  │ ║
  ║  │  4. Wait for confirmation                               │ ║
  ║  │  5. Store alert + Log AI disclosure                     │ ║
  ║  │  6. Verify proof on-chain                               │ ║
  ║  └──────────────────────┬──────────────────────────────────┘ ║
  ╚══════════════════════════╪══════════════════════════════════╝
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌──────────────┐ ┌──────────┐ ┌─────────────┐
     │ BNB Chain    │ │ Alert    │ │ AI          │
     │ Testnet      │ │ API      │ │ Disclosure  │
     │              │ │ :3002    │ │ Log         │
     │ SafeLayer    │ │          │ │             │
     │ Registry     │ │ /alerts  │ │ JSONL file  │
     │ Contract     │ │ /verify  │ │ Every       │
     │              │ │ /health  │ │ decision    │
     │ Event:       │ │          │ │ recorded    │
     │ RiskReport   │ │          │ │             │
     │ Submitted    │ │          │ │             │
     └──────────────┘ └──────────┘ └─────────────┘
```

---

## Execution Flow (Step-by-Step)

```
[T+0s]   Agent starts
[T+0s]   Alert API server starts on port 3002
[T+1s]   OBSERVE: Scan blocks 47839201 → 47839240 (40 blocks)
[T+3s]   OBSERVE: Found 2 new contract deployments
[T+3s]   DECIDE:  Check registry for 0xABC... → no existing report
[T+5s]   DECIDE:  Analyze 0xABC... via SafeLayer engine (5 analyzers)
[T+15s]  DECIDE:  Result: score=72, level=High, shouldSubmit=true
[T+15s]  DECIDE:  Check registry for 0xDEF... → no existing report
[T+17s]  DECIDE:  Analyze 0xDEF... via SafeLayer engine
[T+25s]  DECIDE:  Result: score=18, level=Very Low, shouldSubmit=true
[T+25s]  ACT:     Submit 0xABC... (score=72, level=HIGH)
[T+25s]  ACT:     Build report → hash → submitRiskReport()
[T+30s]  ACT:     TX confirmed: 0x123... (block 47839245, gas 85000)
[T+30s]  ACT:     Event RiskReportSubmitted emitted
[T+30s]  ACT:     Alert stored, AI disclosure logged
[T+30s]  ACT:     Proof verified on-chain
[T+31s]  ACT:     Submit 0xDEF... (score=18, level=LOW)
[T+36s]  ACT:     TX confirmed: 0x456... (block 47839246, gas 82000)
[T+36s]  CYCLE:   Complete. Targets: 2 | Submitted: 2 | Failed: 0
[T+120s] CYCLE:   Next cycle starts...
```

---

## Quick Start

### Prerequisites

- Node.js >= 18
- SafeLayer backend running on port 3001
- BNB Testnet tBNB for gas ([faucet](https://www.bnbchain.org/en/testnet-faucet))
- Analyzer wallet approved on SafeLayerRegistry contract

### Installation

```bash
cd openclaw-agent
npm install
npm run build
```

### Configuration

```bash
# Required
export ANALYZER_PRIVATE_KEY="your_private_key"

# Optional (defaults shown)
export BNB_RPC_URL="https://data-seed-prebsc-1-s1.binance.org:8545/"
export REGISTRY_CONTRACT_ADDRESS="0x20B28a7b961a6d82222150905b0C01256607B5A3"
export SAFELAYER_BACKEND_URL="http://localhost:3001"
export RISK_SUBMISSION_THRESHOLD="0"
export CYCLE_INTERVAL_MS="120000"
export BLOCKS_PER_CYCLE="40"
export ALERT_API_PORT="3002"
```

### Run

```bash
# Start SafeLayer backend first
cd ../backend && npm run dev &

# Start autonomous agent
cd ../openclaw-agent && npm run agent
```

The agent will:
1. Start the alert API on port 3002
2. Run the first monitoring cycle immediately
3. Schedule cycles every 2 minutes
4. Log all actions to console and `logs/ai-disclosure.jsonl`

---

## Alert API

### `GET /alerts`

Returns recent risk alerts.

```json
{
  "alerts": [
    {
      "id": "alert-1708300000-0xABC123",
      "address": "0xABC123...",
      "riskScore": 72,
      "riskLevel": "High",
      "confidenceLevel": "high",
      "txHash": "0x123...",
      "reportHash": "0xdef...",
      "blockNumber": 47839245,
      "timestamp": "2026-02-18T12:00:00.000Z",
      "keyFindings": ["[HIGH] Unverified Source Code"],
      "breakdown": {
        "contract_risk": 80,
        "behavior_risk": 65,
        "reputation_risk": 50
      },
      "explorerUrl": "https://testnet.bscscan.com/tx/0x123..."
    }
  ],
  "count": 1,
  "total": 15
}
```

### `GET /alerts/high`

High-risk alerts only (score >= 67).

### `GET /alerts/0x...`

Alerts for a specific address.

### `GET /alerts/stats`

```json
{
  "total": 42,
  "high": 5,
  "medium": 15,
  "low": 22,
  "lastAlert": "2026-02-18T12:30:00.000Z"
}
```

### `GET /verify/0x...`

Verify on-chain proof for an address:

```json
{
  "address": "0xABC...",
  "verified": true,
  "localHash": "0xdef...",
  "onChainHash": "0xdef...",
  "onChainScore": 72,
  "onChainTimestamp": "2026-02-18T12:00:00.000Z",
  "onChainAnalyzer": "0x245..."
}
```

### `GET /disclosure`

AI disclosure log — every autonomous decision recorded:

```json
{
  "entries": [
    {
      "cycleId": 1,
      "address": "0xABC...",
      "action": "onchain_submission",
      "riskScore": 72,
      "riskLevel": "High",
      "txHash": "0x123...",
      "reportHash": "0xdef...",
      "modelUsed": "SafeLayer Risk Intelligence Engine v2.0",
      "analyzersUsed": [
        "ContractAnalyzer",
        "BehaviorAnalyzer",
        "WalletHistoryChecker",
        "TransparencyChecker",
        "ScamDatabaseChecker"
      ],
      "scoringFormula": "Risk = (Contract*0.40) + (Behavior*0.40) + (Reputation*0.20)",
      "autonomous": true,
      "timestamp": "2026-02-18T12:00:00.000Z"
    }
  ]
}
```

### `GET /health`

```json
{
  "status": "running",
  "agent": "SafeLayer Risk Sentinel",
  "framework": "OpenClaw",
  "chain": "BNB Chain Testnet",
  "uptime": 3600,
  "alertCount": 42,
  "disclosureCount": 42
}
```

---

## Smart Contract

### SafeLayerRegistry (BNB Testnet)

| Property | Value |
|----------|-------|
| Address | `0x20B28a7b961a6d82222150905b0C01256607B5A3` |
| Network | BNB Chain Testnet (Chain ID: 97) |
| Solidity | 0.8.20 |
| Security | OpenZeppelin Ownable2Step |
| Deployer | `0x24557aD7e2d5D8699c8696383E037678C7644411` |

### Contract Interaction

```typescript
// 1. Build report data
const reportData = {
  address: "0xABC...",
  riskScore: 72,
  riskLevel: "High",
  breakdown: { contract_risk: 80, behavior_risk: 65, reputation_risk: 50 },
  timestamp: "2026-02-18T12:00:00.000Z",
  schemaVersion: "2.0"
};

// 2. Hash report
const reportHash = ethers.keccak256(
  ethers.toUtf8Bytes(JSON.stringify(reportData))
);

// 3. Submit on-chain
const tx = await contract.submitRiskReport(
  "0xABC...",    // target address
  72,             // risk score (0-100)
  2,              // risk level (LOW=0, MEDIUM=1, HIGH=2)
  reportHash      // keccak256 hash of report JSON
);
const receipt = await tx.wait();

// 4. Event emitted
// RiskReportSubmitted(0xABC..., 72, HIGH, 0xdef..., analyzerAddr, timestamp)

// 5. Verify
console.log(`TX: https://testnet.bscscan.com/tx/${receipt.hash}`);
```

### Verification Process

```
Original Report (JSON) → keccak256 → Local Hash
                                        ↓
On-Chain Registry → getLatestReportForTarget() → On-Chain Hash
                                        ↓
                               Compare: Local Hash === On-Chain Hash
                                        ↓
                                   VERIFIED
```

---

## How to Prove Autonomous Execution

1. **AI Disclosure Log**: Every decision in `logs/ai-disclosure.jsonl` with `"autonomous": true`
2. **On-Chain Proof**: Each `RiskReportSubmitted` event has analyzer address + timestamp
3. **No Human Input**: Agent runs on `setInterval` — zero manual triggers
4. **Verifiable**: `GET /verify/0x...` proves hash matches on-chain
5. **Consistent Timing**: Transaction timestamps show regular 2-minute intervals

---

## AI Disclosure Log Format

Each entry in `logs/ai-disclosure.jsonl`:

```json
{
  "cycleId": 1,
  "address": "0xABC...",
  "action": "onchain_submission",
  "riskScore": 72,
  "riskLevel": "High",
  "txHash": "0x123...",
  "reportHash": "0xdef...",
  "modelUsed": "SafeLayer Risk Intelligence Engine v2.0",
  "analyzersUsed": ["ContractAnalyzer", "BehaviorAnalyzer", "WalletHistoryChecker", "TransparencyChecker", "ScamDatabaseChecker"],
  "scoringFormula": "Risk = (Contract*0.40) + (Behavior*0.40) + (Reputation*0.20)",
  "autonomous": true,
  "timestamp": "2026-02-18T12:00:00.000Z"
}
```

---

## Risk Scoring Formula

```
Risk Score = (Contract Risk * 0.40) + (Behavior Risk * 0.40) + (Reputation Risk * 0.20)
```

| Analyzer | Weight | Checks |
|----------|--------|--------|
| Contract | 40% | Bytecode patterns, source verification, owner privileges, honeypot detection |
| Behavior | 40% | Tx count, balance, holder concentration, DEX liquidity, rugpull risk |
| Wallet | (part of behavior) | Deployed contracts, fund flow analysis, scam address links |
| Transparency | (part of reputation) | GitHub presence, audit reports, team doxxing status |
| Scam DB | (part of reputation) | Known scam matching, blacklist checks, honeypot registry |

### Floor Rules

| Condition | Minimum Score |
|-----------|---------------|
| Critical severity flag | 70 |
| Known scam DB match | 85 |
| Linked rugpull | 80 |
| 3+ high-severity flags | 60 |
| Any component >= 75 | 60 |

---

## Project Structure

```
openclaw-agent/
├── package.json                 # Plugin manifest + agent scripts
├── tsconfig.json                # TypeScript config
├── openclaw.json                # OpenClaw agent configuration
├── AGENTS.md                    # Agent identity + OBSERVE/DECIDE/ACT lifecycle
├── TOOLS.md                     # Tool documentation
├── README.md                    # This file
├── src/
│   ├── index.ts                 # OpenClaw plugin entry (registers 4 tools)
│   ├── agent.ts                 # Standalone autonomous agent runner
│   ├── server.ts                # Real-time alert API server
│   ├── tools/
│   │   ├── monitorBlocks.ts     # OBSERVE: scan blocks for deployments
│   │   ├── analyzeAddress.ts    # DECIDE: call risk engine
│   │   ├── submitOnChain.ts     # ACT: hash + submit on-chain
│   │   └── queryRegistry.ts     # DECIDE: check existing reports
│   └── services/
│       ├── blockWatcher.ts      # WebSocket/polling block monitor
│       ├── alertStore.ts        # In-memory alert storage
│       ├── proofVerifier.ts     # On-chain proof verification
│       └── disclosureLog.ts     # AI disclosure logging
├── workspace/
│   └── skills/
│       └── bnb-risk-sentinel/
│           └── SKILL.md         # OpenClaw skill instructions
└── logs/
    └── ai-disclosure.jsonl      # Persistent AI decision log
```

---

## Deployment to Testnet

### Step 1: Contract (already deployed)

`0x20B28a7b961a6d82222150905b0C01256607B5A3` on BNB Testnet.

### Step 2: Approve Analyzer Wallet

```javascript
await registry.approveAnalyzer("0xYourAgentWalletAddress");
```

### Step 3: Fund Agent Wallet

Get tBNB from [BNB Testnet Faucet](https://www.bnbchain.org/en/testnet-faucet). Each submission costs ~0.001 tBNB.

### Step 4: Start

```bash
cd backend && npm run dev &
cd openclaw-agent && npm run agent
```

### Step 5: Verify

```bash
curl http://localhost:3002/health
curl http://localhost:3002/alerts
curl http://localhost:3002/disclosure
```

---

## Hackathon Alignment

| Criterion | SafeLayer |
|-----------|-----------|
| Real product | Deployed contract, live backend, working frontend |
| AI-first | 5 parallel AI analyzers, evidence-based scoring |
| Autonomous | Cron monitoring, no manual input, AI disclosure log |
| On-chain execution | `submitRiskReport()` with event emission |
| Immutable verification | keccak256 hash on-chain, `/verify` endpoint |
| Transparent methodology | Open formula, floor rules, category breakdown |
| OpenClaw integration | Plugin + AGENTS.md + SKILL.md + Tools |

---

## License

MIT
