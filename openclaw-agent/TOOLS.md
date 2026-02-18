# SafeLayer Agent Tools

## bnb_monitor_blocks

Scans recent BNB Chain blocks for new contract deployments (transactions where `to` is null). Returns addresses of newly deployed contracts with deployer info, tx hash, and block number.

- `blocksBack` (number, default 5, max 20): How many recent blocks to scan
- `flush` (boolean): Clear the discovery buffer after returning results
- Call periodically via cron to discover new contracts

## bnb_analyze_address

Runs the full SafeLayer Risk Intelligence Engine against a BNB Chain address. Calls the SafeLayer backend API which executes 5 parallel analyzers:

1. **Contract Analyzer** — bytecode patterns, source verification, owner privileges
2. **Behavior Analyzer** — tx count, balance, holder concentration, liquidity, rugpull risk
3. **Wallet History** — deployed contracts, fund flow, scam links
4. **Transparency** — GitHub presence, audit reports, team doxxing
5. **Scam Database** — known scam matching, blacklist, honeypot registry

Returns: `risk_score` (0-100), `risk_level`, `breakdown`, `keyFindings`, `recommendations`.
Takes 5-30 seconds depending on RPC latency.

- `address` (string, required): The BNB Chain address to analyze

## bnb_submit_onchain

Hashes the risk report using keccak256 and submits the proof to the SafeLayerRegistry smart contract on BNB Chain Testnet. The contract emits a `RiskReportSubmitted` event.

Requires `ANALYZER_PRIVATE_KEY` to be configured and the wallet to be an approved analyzer on the contract.

Returns: `txHash`, `blockNumber`, `gasUsed`, `reportHash`.

- `address` (string, required): Target address that was analyzed
- `riskScore` (number, required): Risk score 0-100
- `riskLevel` (string, required): Risk level string
- `breakdown` (object, required): `{ contract_risk, behavior_risk, reputation_risk }`

## bnb_query_registry

Queries the SafeLayerRegistry contract for existing risk reports on an address. Use this **before** analyzing to avoid duplicate work.

Returns: latest report (if any), report count for address, total registry reports, analyzer approval status.

- `address` (string, required): BNB Chain address to query
