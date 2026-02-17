# SafeLayer — Explainable Risk Intelligence for BNB Chain

SafeLayer is an evidence-based risk analysis platform for BNB Smart Chain. It evaluates wallet addresses and smart contracts using on-chain data, producing transparent risk scores with full formula disclosure and immutable on-chain proof via a registry contract.

---

## Problem Statement

Web3 users regularly interact with unverified smart contracts and unknown wallet addresses on BNB Chain. Existing tools provide opaque risk ratings with no explanation of how scores are derived, making it impossible to verify their accuracy or understand the underlying risk factors.

This lack of transparency leads to:
- Users blindly trusting or dismissing risk scores
- No way to audit or reproduce risk assessments
- No immutable record of when a risk assessment was performed

---

## Solution

SafeLayer provides a **fully explainable** risk analysis pipeline:

1. **Evidence-Based Scoring** — Every risk flag includes severity, description, data source, and a link to verify on BscScan
2. **Formula Transparency** — The exact formula, weights, raw scores, and any adjustments are returned to the user
3. **On-Chain Proof** — Each analysis result is hashed (keccak256) and submitted to a registry contract on BNB Chain, creating an immutable, timestamped proof

---

## System Architecture

```
User
  |
  v
[Next.js Frontend]  ──>  [Express Backend API]
                              |
                    +---------+---------+
                    |         |         |
               [Contract] [Behavior] [Reputation]
               Analysis   Analysis    Analysis
                    |         |         |
                    +----+----+----+----+
                         |         |
                    [Risk Engine]  |
                    Aggregation   |
                         |        |
                    [Score + Evidence + Explanation]
                         |
                    [Registry Service]
                         |
                    [SafeLayerRegistry.sol]
                    BNB Chain Testnet
```

**Analysis Modules:**

| Module | What it checks |
|--------|---------------|
| Contract Analyzer | Source verification, owner privileges, mint/burn, proxy patterns, honeypot logic, selfdestruct |
| Behavior Analyzer | Transaction volume, holder concentration, DEX pair presence, liquidity, contract age, rug pull indicators |
| Wallet History | Deployer history, linked rugpulls, fund flow, account age, balance |
| Transparency | GitHub activity, audit reports, team doxxing status |
| Scam Database | Blacklists, known scam addresses, rugpull history |

---

## Risk Formula

```
Risk Score = (Contract Risk x 0.40) + (Behavior Risk x 0.40) + (Reputation Risk x 0.20)
```

**Floor rules** guarantee minimum scores when critical signals are detected:
- Critical severity flag detected → minimum score 70
- Known scam database match → minimum score 85
- Linked to known rugpull → minimum score 80
- 3+ high severity flags → minimum score 60

**Risk Levels:**

| Score | Level |
|-------|-------|
| 0–19 | Very Low |
| 20–39 | Low |
| 40–59 | Medium |
| 60–79 | High |
| 80–100 | Very High |

All weights, raw scores, and adjustments are included in every API response under `scoreCalculation`.

---

## On-Chain Registry Contract

| Field | Value |
|-------|-------|
| Contract | `SafeLayerRegistry` (Ownable2Step) |
| Address | [`0x20B28a7b961a6d82222150905b0C01256607B5A3`](https://testnet.bscscan.com/address/0x20B28a7b961a6d82222150905b0C01256607B5A3#code) |
| Network | BNB Smart Chain Testnet |
| Chain ID | 97 |
| Deployer | `0x24557aD7e2d5D8699c8696383E037678C7644411` |
| Verified | Yes (BscScan) |

**Key functions:**
- `submitRiskReport(address, uint8, RiskLevel, bytes32)` — stores hashed proof on-chain (onlyAnalyzer)
- `submitBatchReports(...)` — batch submission, saves ~21k gas per additional report
- `getLatestReportForTarget(address)` — retrieve the most recent report
- `getReportsByTarget(address)` — all report indices for an address
- `approvedAnalyzers(address)` — check analyzer authorization

**Gas optimizations:** custom errors, struct packing, unchecked loop increments, storage pointers, 2-step ownership transfer.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, ethers.js v6 |
| Smart Contract | Solidity 0.8.20, OpenZeppelin, Hardhat |
| Data Sources | BNB Chain RPC, BscScan API, PancakeSwap V2 Factory |
| Testing | Jest |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone and install all workspaces
npm install --workspaces
```

### Run Locally

```bash
# Terminal 1 — Backend (port 3001)
cd backend
cp .env.example .env   # Add your BSCSCAN_API_KEY
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

### Environment Variables (Backend)

```env
PORT=3001
BSCSCAN_API_KEY=your_bscscan_api_key
BNB_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
REGISTRY_CONTRACT_ADDRESS=0x20B28a7b961a6d82222150905b0C01256607B5A3
ANALYZER_PRIVATE_KEY=          # Optional — enables on-chain submission
```

### API Endpoints

```
GET  /health                         — Service health check
GET  /api/risk/:address              — Full risk analysis with on-chain submission
GET  /api/registry/info              — Registry contract status
GET  /api/registry/:address          — Latest on-chain report for address
GET  /api/registry/:address/history  — All on-chain reports for address
```

---

## Smart Contract Deployment

```bash
cd smart-contracts
cp .env.example .env   # Add deployer key and BscScan API key

npx hardhat compile
npx hardhat run scripts/deploy.js --network bnbTestnet
```

Verification:
```bash
HARDHAT_NETWORK=bnbTestnet node scripts/verify.js testnet
```

---

## AI Usage Disclosure

This project was developed with the assistance of multiple AI tools:

- **ChatGPT Pro** (OpenAI) — Architecture design, scoring logic, documentation
- **GitHub Copilot Pro** — Code generation and refactoring
- **Claude Code** (Anthropic) — Complex logic validation, smart contract review, gas optimization

All AI-generated outputs were manually reviewed and validated. The risk scoring engine is fully deterministic at runtime — no AI inference, no LLM calls, no probabilistic models. See [docs/ai-usage.md](docs/ai-usage.md) for full disclosure.

---

## Limitations

- **Testnet only** — currently deployed on BNB Testnet (chain ID 97), not mainnet
- **No persistent database** — risk analysis results are cached in-memory (2 min TTL), not stored in a database
- **BscScan rate limits** — free API tier limits concurrent requests; analysis may slow under heavy load
- **Scam database is local** — uses a hardcoded list rather than a live external threat feed
- **No token price data** — does not fetch real-time token prices or market cap
- **Single analyzer** — the deployer wallet is the only approved analyzer; no multi-party verification

---

## Future Improvements

- Mainnet deployment with multi-sig ownership
- External scam database API integration (GoPlus, HashDit)
- PostgreSQL persistence for analysis history and analytics
- Token price and market cap integration via DEX aggregators
- Multi-analyzer support with reputation scoring for analyzers
- Browser extension for inline risk warnings on BscScan and DApps
- Batch analysis dashboard for portfolio-level risk assessment

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/api.md](docs/api.md) | API endpoints, request/response formats |
| [docs/ai-usage.md](docs/ai-usage.md) | AI tools disclosure (hackathon requirement) |
| [docs/environment.md](docs/environment.md) | Environment variables reference |
| [docs/docker.md](docs/docker.md) | Docker setup |
| [docs/contributing.md](docs/contributing.md) | Contribution guidelines |

---

## License

MIT
