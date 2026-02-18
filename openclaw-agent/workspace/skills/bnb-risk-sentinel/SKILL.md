---
name: bnb-risk-sentinel
description: >
  Autonomous BNB Chain risk analysis sentinel. Monitors new contract deployments,
  runs SafeLayer's 5-module risk intelligence engine, and submits immutable proof
  on-chain via the SafeLayerRegistry contract.
user-invocable: true
---

# BNB Risk Sentinel Skill

## Quick Reference

| Situation | Action |
|-----------|--------|
| Cron triggers "monitoring cycle" | `bnb_monitor_blocks` → analyze each → submit on-chain |
| User asks "is this address safe?" | `bnb_query_registry` → `bnb_analyze_address` → present results |
| Analysis complete, score >= 0 | `bnb_submit_onchain` per AGENTS.md decision policy |
| HIGH risk detected (score >= 67) | Submit on-chain AND announce alert with tx hash |

## Monitoring Cycle (Autonomous)

When triggered by cron or message containing "run monitoring cycle":

1. **Discover**: Call `bnb_monitor_blocks` with `{ "blocksBack": 10, "flush": true }`
2. **Deduplicate**: For each contract address, call `bnb_query_registry` to skip if recently analyzed (< 5 min ago)
3. **Analyze**: Call `bnb_analyze_address` for each new contract
4. **Record**: Call `bnb_submit_onchain` for each analysis result, passing:
   - `address`: the analyzed address
   - `riskScore`: from analysis result
   - `riskLevel`: from analysis result
   - `breakdown`: `{ contract_risk, behavior_risk, reputation_risk }` from analysis result
5. **Report**: Summarize: how many blocks scanned, contracts found, risk levels, tx hashes

## On-Demand Analysis

When a user provides an address to analyze:

1. Validate it matches `0x` followed by 40 hex characters
2. Call `bnb_query_registry` with the address to show existing data
3. Call `bnb_analyze_address` for fresh analysis
4. Present the results clearly:
   - Risk score and level
   - Key findings (top 3-5)
   - Recommendations
   - Breakdown by category
5. If AUTO_SUBMIT_ONCHAIN is true, call `bnb_submit_onchain`
6. Include the transaction hash and BscScan link in the response

## Monitoring Cycle Summary Format

After completing a monitoring cycle, report like this:

```
SafeLayer Monitoring Cycle Complete
Blocks scanned: {fromBlock} - {toBlock}
New contracts found: {count}

Results:
- 0xABC...DEF: Score 72/100 (HIGH) — tx: 0x123...
- 0x123...456: Score 15/100 (LOW)  — tx: 0x456...

Total reports submitted: {count}
```

## Alert Format (HIGH Risk)

When score >= 67, use this format:

```
SafeLayer Risk Alert
Address: {address}
Risk Score: {score}/100 ({level})
Key Finding: {top finding from keyFindings}
On-Chain Proof: {txHash}
Verify: https://testnet.bscscan.com/tx/{txHash}
```
