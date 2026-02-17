# Environment Variables

## Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `RATE_LIMIT_MAX` | `30` | Max requests per minute per IP |
| `BSCSCAN_API_KEY` | — | BscScan API key ([get one](https://bscscan.com/apis)) |
| `BNB_RPC_URL` | testnet RPC | BNB Chain RPC endpoint |
| `REGISTRY_CONTRACT_ADDRESS` | testnet address | SafeLayerRegistry contract address |
| `ANALYZER_PRIVATE_KEY` | — | Wallet key for on-chain submission (optional) |
| `DATABASE_URL` | — | PostgreSQL connection string (optional) |

## Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:3001` | Backend API URL |
| `NEXT_PUBLIC_BNB_RPC_URL` | testnet RPC | BNB Chain RPC (if needed client-side) |

All `NEXT_PUBLIC_*` variables are embedded in the client bundle. Never put secrets here.

## Smart Contracts (`smart-contracts/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DEPLOYER_PRIVATE_KEY` | — | Deployer wallet key (without 0x prefix) |
| `BNBTESTNET_RPC_URL` | testnet RPC | BNB Testnet RPC |
| `BSCSCAN_API_KEY` | — | For contract verification |

## Setup

```bash
# Copy example files
cp .env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp smart-contracts/.env.example smart-contracts/.env

# Fill in your values, then start
cd backend && npm run dev
cd frontend && npm run dev
```
