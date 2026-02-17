# AI Usage Disclosure

SafeLayer was developed with the assistance of AI tools throughout the development lifecycle. This document provides full transparency on which tools were used, how they contributed, and what safeguards were applied.

---

## Tools Used

| Tool | Role |
|------|------|
| **ChatGPT Pro** (OpenAI) | Architecture design, scoring logic formulation, documentation drafting |
| **GitHub Copilot Pro** | Code generation, refactoring, autocomplete across TypeScript and Solidity |
| **Claude Code** (Anthropic) | Complex logic validation, smart contract review, gas optimization, deployment scripting |

---

## How AI Was Used

### Architecture & Design
- Scoring formula design: weighted risk model with floor rules
- Module separation strategy (contract, behavior, reputation pillars)
- On-chain registry proof concept (hash-and-store pattern)

### Code Generation
- Backend analysis modules (contractAnalyzer, behaviorAnalyzer, walletHistoryChecker, etc.)
- Frontend React components (RiskCard, EvidencePanel, RadarChart, RegistryStatus, etc.)
- Smart contract (SafeLayerRegistry.sol) with Ownable2Step, custom errors, batch operations
- Deployment and verification scripts (Hardhat)

### Debugging & Optimization
- BigInt serialization fix in ethers.js v6 deploy scripts
- Etherscan API v1 to v2 migration for BscScan verification
- Solidity gas optimizations: custom errors, struct packing, unchecked increments, storage pointers
- TypeScript type alignment across frontend/backend boundaries

### Documentation
- README structure and content
- API documentation
- Inline code comments where non-obvious logic exists

---

## What AI Did NOT Do

- AI did not have access to private keys, wallets, or deployment credentials
- AI did not autonomously deploy contracts or push code to production
- AI did not make final architectural decisions without developer review
- AI did not generate or access any user data

---

## Safeguards Applied

1. **Manual review** — All AI-generated code was reviewed line-by-line before integration
2. **Type checking** — TypeScript strict mode catches structural errors across the codebase
3. **Testing** — Jest test suites validate component behavior and API contracts
4. **On-chain verification** — Smart contract was verified on BscScan; source code is publicly auditable
5. **Deterministic scoring** — The risk engine uses a fully deterministic, rule-based scoring model with no AI inference at runtime. Every score is reproducible given the same on-chain inputs.

---

## Runtime Behavior

SafeLayer's risk scoring engine is **not AI-powered at runtime**. It uses:
- Deterministic weighted formulas with published weights (40/40/20)
- Rule-based flag detection from on-chain data
- Floor rules with transparent adjustment logging
- No machine learning models, no LLM calls, no probabilistic inference

The term "AI" applies only to the development process, not to the production system's behavior.
