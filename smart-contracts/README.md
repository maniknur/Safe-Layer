# SafeLayerRegistry Smart Contract

## Overview

**SafeLayerRegistry** is a production-grade Solidity smart contract that acts as an **immutable on-chain registry for off-chain risk analysis proofs**.

It is designed for **SafeLayer**, a Web3 security analysis platform, and stores cryptographic hashes of risk reports analyzed by backend systems.

### Key Design Principle

⚠️ **This contract does NOT calculate risk.** It only stores immutable proofs (hashes) of off-chain analysis results.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         SafeLayer Backend (Off-Chain)               │
│  - Analyzes blockchain contracts/addresses          │
│  - Generates JSON risk reports                      │
│  - Hashes reports with keccak256                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ submitRiskReport()
                   │ (hash + metadata)
                   ▼
┌─────────────────────────────────────────────────────┐
│   SafeLayerRegistry Smart Contract (On-Chain)      │
│   - Stores hashes of risk reports                   │
│   - Immutable proof of analysis                     │
│   - Indexed by target address                       │
│   - Queryable and auditable                         │
└─────────────────────────────────────────────────────┘
```

## Features

### ✅ Smart Contract Features

- **Gas Efficient:** Optimized with Solidity 0.8.20 compiler (200 runs)
- **Immutable Proofs:** Once stored, reports cannot be modified
- **Indexed Storage:** Reports indexed by target address for O(1) lookup
- **Analyzer Approval System:** Only approved analyzers can submit reports
- **Event Logging:** Comprehensive event emission for indexing and UI updates
- **Input Validation:** Strict checks on all parameters

### 📋 Core Functions

| Function | Access | Purpose |
|----------|--------|---------|
| `submitRiskReport()` | Approved Analyzers | Submit a hashed risk report |
| `getReport()` | Public | Retrieve report by index |
| `getReportsByTarget()` | Public | Get all report IDs for an address |
| `getLatestReportForTarget()` | Public | Fetch most recent report for address |
| `getReportCountForTarget()` | Public | Count reports for an address |
| `getTotalReports()` | Public | Get total report count |
| `approveAnalyzer()` | Owner | Grant submission access |
| `removeAnalyzer()` | Owner | Revoke submission access |

### 🔐 Security Features

- **Owner-based Authorization:** Only owner can manage analyzers
- **Input Validation:** 
  - Non-zero addresses
  - Risk score ≤ 100
  - Non-zero report hash
  - Risk level matches score range
- **Immutable Data:** Event-based on-chain logging
- **Private Storage:** Report array is private; access via getters only

## Contract Specification

### Data Structures

```solidity
struct RiskReport {
    address targetAddress;      // Address analyzed
    uint8 riskScore;            // 0-100
    RiskLevel riskLevel;        // LOW (0-33), MEDIUM (34-66), HIGH (67-100)
    bytes32 reportHash;         // Keccak256 hash of JSON report
    uint256 timestamp;          // Block timestamp
    address analyzer;           // Submitter address
}

enum RiskLevel {
    LOW,      // 0-33
    MEDIUM,   // 34-66
    HIGH      // 67-100
}
```

### Events

```solidity
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
```

## Deployment

### Quick Start

```bash
# Install dependencies
npm install

# Compile contract
npm run compile

# Deploy to testnet
npm run deploy:testnet

# Verify on BscScan
npm run verify:testnet
```

### Full Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive step-by-step guide.

## Usage Examples

### 1. Hash a Risk Report (Backend)

```javascript
const { ethers } = require("ethers");

function hashRiskReport(report) {
  const jsonString = JSON.stringify(report);
  const hash = ethers.keccak256(ethers.toUtf8Bytes(jsonString));
  return hash;
}

const report = {
  targetAddress: "0x1234567890123456789012345678901234567890",
  riskScore: 75,
  riskLevel: "HIGH",
  findings: { /* ... */ },
  metrics: { /* ... */ }
};

const hash = hashRiskReport(report);
```

### 2. Submit Report to Contract

```javascript
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, ABI, wallet);

const tx = await contract.submitRiskReport(
  "0xabcdef...",  // target address
  75,              // risk score (0-100)
  2,               // risk level (0=LOW, 1=MEDIUM, 2=HIGH)
  "0x1234..."      // report hash
);

await tx.wait();
```

### 3. Query Reports

```javascript
// Get all report IDs for an address
const reportIds = await contract.getReportsByTarget(targetAddress);

// Get specific report
const report = await contract.getReport(reportId);

// Get latest report for address
const latest = await contract.getLatestReportForTarget(targetAddress);

// Count reports
const count = await contract.getReportCountForTarget(targetAddress);

// Total reports in registry
const total = await contract.getTotalReports();
```

## Integration with Backend

### Backend Flow

1. **Analysis:** Backend performs off-chain risk analysis
2. **Hashing:** Generate JSON report and hash with keccak256
3. **Submission:** Call `submitRiskReport()` with hash and metadata
4. **Proof:** Immutable on-chain record created

### Approving Backend Analyzer

```javascript
// Owner calls:
await contract.approveAnalyzer(backendAnalyzerAddress);
```

See [scripts/backend-integration.js](./scripts/backend-integration.js) for complete examples.

## Deployment Details

### BNB Smart Chain Testnet

| Parameter | Value |
|-----------|-------|
| Network | BNB Smart Chain Testnet |
| RPC | https://data-seed-prebsc-1-s1.binance.org:8545/ |
| Chain ID | 97 |
| Explorer | https://testnet.bscscan.com |

### BNB Smart Chain Mainnet

| Parameter | Value |
|-----------|-------|
| Network | BNB Smart Chain |
| RPC | https://bsc-dataseed1.binance.org:8545/ |
| Chain ID | 56 |
| Explorer | https://bscscan.com |

## Gas Optimization

Contract is optimized with:
- Solidity 0.8.20 compiler
- 200 optimization runs
- Efficient storage packing
- Indexed arrays for O(1) lookups

### Estimated Gas Costs (Testnet)

| Operation | Gas | Cost (at 10 gwei) |
|-----------|-----|-------------------|
| Deploy | ~500K | ~0.005 BNB |
| Submit Report | ~100K | ~0.001 BNB |
| Query (view) | 0 | Free |

## File Structure

```
smart-contracts/
├── contracts/
│   └── SafeLayerRegistry.sol     # Main contract
├── scripts/
│   ├── deploy.js                 # Deployment script
│   ├── verify.js                 # Verification script
│   └── backend-integration.js    # Integration examples
├── deployments/                  # Deployment records (auto-generated)
├── hardhat.config.js             # Hardhat configuration
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

## Development

### Compile

```bash
npm run compile
```

### Test

```bash
npm run test
```

### Deploy

```bash
# Testnet
npm run deploy:testnet

# Mainnet
npm run deploy:mainnet
```

### Verify

```bash
# Testnet
npm run verify:testnet

# Mainnet
npm run verify:mainnet
```

### Clean Build

```bash
npm run clean
npm run compile
```

## Security Considerations

### ✅ Implemented Protections

- Owner-based authorization
- Address validation (non-zero checks)
- Risk score validation (≤ 100)
- Risk level validation (matches score range)
- Immutable storage (no delete/update functions)
- Private arrays with public getters

### 🔍 Audit Notes

- No external calls (no reentrancy risk)
- No assembly code
- No complex state transitions
- Event-based state transparency

### ⚠️ Important Notes

- Contract owner has power to approve/remove analyzers
- Backend private keys must be kept secure
- Only approved analyzers can submit reports
- Reports are immutable once submitted

## Troubleshooting

### Deployment Issues

**"insufficient funds"**
- Testnet: Use BNB faucet (https://testnet.binance.org/faucet)
- Mainnet: Send BNB from exchange

**"BSCSCAN_API_KEY not found"**
- Create free account at https://bscscan.com/apis
- Add key to `.env` file

**"Network not configured"**
- Ensure `.env` has `BNBTESTNET_RPC_URL` or `BNBMAINNET_RPC_URL`
- Check network connectivity

### Contract Issues

**"Only approved analyzers can submit"**
- Call `approveAnalyzer(address)` from owner account
- Verify caller matches approved address

**"Risk level mismatch"**
- Ensure risk level enum value matches score:
  - 0-33: RiskLevel.LOW (0)
  - 34-66: RiskLevel.MEDIUM (1)
  - 67-100: RiskLevel.HIGH (2)

## Production Checklist

- [ ] Contract deployed and verified on mainnet
- [ ] Owner address is secure multi-sig (recommended)
- [ ] Backend analyzer address approved
- [ ] Backend environment variables configured
- [ ] Contract address documented in backend
- [ ] Monitoring/alerting set up for events
- [ ] Backup of deployment info stored securely
- [ ] MultiSig or DAO governance considered

## License

MIT License - See LICENSE file

## Support & Links

- **GitHub:** [SafeLayer Repository](https://github.com/safelayer/safelayer-bnb)
- **BscScan:** [Contract Verification Platform](https://bscscan.com)
- **Hardhat:** [Development Environment](https://hardhat.org)
- **Ethers.js:** [Blockchain Library](https://docs.ethers.org)

---

**Built with ❤️ for Web3 Security**
