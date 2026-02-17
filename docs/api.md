# API Documentation

Base URL: `http://localhost:3001`

---

## Health Check

**GET** `/health`

```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-02-17T12:00:00.000Z",
  "uptime": 1234.5,
  "version": "1.1.0"
}
```

---

## Risk Analysis

**GET** `/api/risk/:address`

Full risk intelligence analysis with evidence, score transparency, and on-chain proof submission.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `address` | path (string) | BNB Chain address (0x + 40 hex chars) |

**Response** (200):
```json
{
  "success": true,
  "address": "0x...",
  "riskScore": 45,
  "riskLevel": "Medium",
  "addressType": "contract",
  "rugPullRisk": 15,

  "breakdown": {
    "contract_risk": 20,
    "behavior_risk": 30,
    "reputation_risk": 10
  },

  "evidence": {
    "contract_flags": [{ "id": "...", "name": "...", "severity": "high", "description": "...", "evidence": "...", "riskWeight": 25, "category": "contract" }],
    "onchain_flags": [],
    "wallet_flags": [],
    "transparency_flags": [],
    "scam_flags": []
  },

  "analysis": {
    "contract": { "isContract": true, "isVerified": true, "codeSize": 5248, "detections": {}, "score": 20 },
    "onchain": { "metrics": { "transactionCount": 150, "balance": "1.5", "rugPullRisk": 15 }, "score": 30 },
    "wallet": { "deployedContracts": [], "linkedRugpulls": [], "ageInDays": 90, "score": 10 },
    "transparency": { "github": { "found": false }, "audit": { "detected": false }, "score": 50 },
    "scamDatabase": { "isBlacklisted": false, "knownScam": false, "score": 0 }
  },

  "onchainIndicators": [
    { "indicator": "Transaction Count", "evidence": "150 transactions", "riskWeight": 0 }
  ],

  "scoreCalculation": {
    "formula": "Risk Score = (Contract Risk x 0.40) + (Behavior Risk x 0.40) + (Reputation Risk x 0.20)",
    "weights": { "contract_risk": 0.4, "behavior_risk": 0.4, "reputation_risk": 0.2 },
    "rawScores": { "contract_risk": 20, "behavior_risk": 30, "reputation_risk": 10 },
    "adjustments": ["No adjustments applied"],
    "finalScore": 22
  },

  "flags": ["[HIGH] Unverified Contract: Source code not verified on BscScan"],

  "explanation": {
    "summary": "This contract has a low risk score (22%)...",
    "keyFindings": ["..."],
    "recommendations": ["..."],
    "riskFactors": ["Contract Risk: 20/100"]
  },

  "registry": {
    "contractAddress": "0x20B28a7b961a6d82222150905b0C01256607B5A3",
    "onChainProof": {
      "txHash": "0x...",
      "blockNumber": 12345678,
      "reportHash": "0x...",
      "gasUsed": "85000"
    },
    "previousReport": null,
    "totalReportsForAddress": 1,
    "submissionStatus": "confirmed",
    "submissionError": null
  },

  "timestamp": "2026-02-17T12:00:00.000Z",
  "analysisTimeMs": 3200
}
```

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid address format |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Registry Endpoints

### Registry Info

**GET** `/api/registry/info`

```json
{
  "success": true,
  "contractAddress": "0x20B28a7b961a6d82222150905b0C01256607B5A3",
  "network": "bnbTestnet",
  "totalReports": 42,
  "analyzerApproved": true,
  "analyzerAddress": "0x..."
}
```

### Latest Report

**GET** `/api/registry/:address`

```json
{
  "success": true,
  "address": "0x...",
  "reportCount": 3,
  "latestReport": {
    "targetAddress": "0x...",
    "riskScore": 45,
    "riskLevel": "MEDIUM",
    "reportHash": "0x...",
    "timestamp": "2026-02-17T12:00:00.000Z",
    "analyzer": "0x..."
  },
  "hasOnChainReport": true
}
```

### Report History

**GET** `/api/registry/:address/history`

```json
{
  "success": true,
  "address": "0x...",
  "reports": [{ "targetAddress": "0x...", "riskScore": 45, "riskLevel": "MEDIUM", "reportHash": "0x...", "timestamp": "...", "analyzer": "0x..." }],
  "count": 3
}
```

---

## Risk Scoring

| Component | Weight | Sources |
|-----------|--------|---------|
| Contract Risk | 40% | Source verification, owner privileges, mint/burn, proxy, honeypot, selfdestruct |
| Behavior Risk | 40% | Transaction volume, holder concentration, DEX pairs, liquidity, rug pull indicators |
| Reputation Risk | 20% | Scam databases, audit reports, GitHub activity, team transparency |

**Risk Levels:**

| Score | Level |
|-------|-------|
| 0-19 | Very Low |
| 20-39 | Low |
| 40-59 | Medium |
| 60-79 | High |
| 80-100 | Very High |

---

## Rate Limiting

- 30 requests per minute per IP (configurable via `RATE_LIMIT_MAX`)
- Returns `429` with `Retry-After` header when exceeded

## CORS

Configurable via `CORS_ORIGIN` environment variable. Default: `http://localhost:3000,http://localhost:3002`

## Caching

- In-memory cache with 2-minute TTL
- Same address within TTL returns cached result (no re-analysis, no new on-chain submission)
