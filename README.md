# SafeLayer BNB - AI-Powered Risk Intelligence Engine

**SafeLayer BNB** is a full-stack, AI-powered risk intelligence engine designed to analyze wallet addresses and smart contracts on the BNB Chain. It provides comprehensive risk scores, detailed breakdowns, and actionable insights.

Built for the BNB Chain Risk Intelligence Hackathon.

---

## ⚡ Quick Start

### 1. Docker (Recommended)
```bash
docker-compose up --build
```
Visit: http://localhost:3000

### 2. Manual Setup
```bash
bash setup.sh
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

**[📖 Full Quick Start Guide →](QUICKSTART.md)**

---

## 🎯 Features

✅ **Wallet Risk Analysis** - Transaction history, account age, behavioral patterns  
✅ **Smart Contract Security** - Vulnerability detection, verification status  
✅ **Liquidity Analysis** - Pool health, token distribution, rug pull risks  
✅ **AI Explanations** - Human-readable summaries and recommendations  
✅ **Real-time Risk Scoring** - Aggregated risk from multiple factors  
✅ **Modern UI** - Clean, responsive interface with TailwindCSS  
✅ **Production Ready** - Logging, error handling, tests, Docker support  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│   - React Components (TypeScript)                       │
│   - TailwindCSS Styling                                │
│   - Axios HTTP Client                                  │
│   → http://localhost:3000                              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓ API Calls (/api/risk/:address)
                       │
┌──────────────────────┴──────────────────────────────────┐
│              Backend (Express/Node.js)                  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │  API Routes                                     │  │
│  │  - GET /health                                 │  │
│  │  - GET /api/risk/:address                      │  │
│  └────────────────┬────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴────────────────────────────────┐  │
│  │  Risk Modules                                   │  │
│  ├─ scanner/       → Smart contract analysis      │  │
│  ├─ wallet/        → Wallet behavior analysis     │  │
│  ├─ liquidity/     → Liquidity assessment         │  │
│  ├─ aggregator/    → Risk score aggregation       │  │
│  └─ ai/            → Explanation generation       │  │
│                                                     │  │
│  → http://localhost:3001                           │  │
└──────────────────┬────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────┐
        ↓                    ↓          ↓
   ┌────────┐          ┌──────────┐  ┌────────┐
   │ BNB    │          │PostgreSQL│  │ Logs   │
   │  RPC   │          │Database  │  │Storage │
   │(Mock)  │          │(Optional)│  │        │
   └────────┘          └──────────┘  └────────┘
```

---

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS 3
- **HTTP**: Axios
- **Web3**: Ethers.js

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Blockchain**: Ethers.js (for future integrations)
- **Database**: PostgreSQL (optional, mocked for MVP)
- **Logging**: Winston
- **Testing**: Jest

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Environment**: dotenv

---

## 📂 Project Structure

```
safelayer-bnb/
├── frontend/                      # Next.js frontend
│   ├── app/
│   │   ├── page.tsx              # Main analyzer page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── RiskAnalyzer.tsx
│   │   └── RiskCard.tsx
│   ├── lib/                      # Utilities
│   │   └── utils.ts             # Address validation
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── backend/                       # Express API
│   ├── src/
│   │   ├── index.ts              # Server entry
│   │   ├── routes/
│   │   │   └── risk.ts           # /api/risk endpoints
│   │   ├── modules/
│   │   │   ├── scanner/          # Smart contracts
│   │   │   ├── wallet/           # Wallet analysis
│   │   │   ├── liquidity/        # Liquidity checks
│   │   │   ├── aggregator/       # Risk scoring
│   │   │   └── ai/               # Explanations
│   │   ├── utils/
│   │   │   ├── logger.ts         # Winston logger
│   │   │   └── validation.ts     # Address validation
│   │   └── __tests__/            # Unit tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── Dockerfile
│
├── .github/workflows/
│   └── ci-cd.yml                 # GitHub Actions
│
├── docker-compose.yml            # Docker compose
├── package.json                  # Monorepo root
├── .env.example                  # Environment template
├── .gitignore
├── Makefile                      # Common commands
├── setup.sh                      # Auto setup script
│
├── README.md                     # This file
├── QUICKSTART.md                 # 5-minute setup
├── API.md                        # API documentation
├── DOCKER.md                     # Docker guide
├── DEVELOPMENT.md                # Dev guide
├── DEPLOYMENT.md                 # Production guide
├── CONTRIBUTING.md               # Contribution guide
└── CHANGELOG.md                  # Version history
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (recommended)
- npm or yarn

### Installation

**Option A: Docker (Fastest)**
```bash
docker-compose up --build
# Visit http://localhost:3000 automatically
```

**Option B: Manual**
```bash
# Install deps
cd backend && npm install
cd ../frontend && npm install

# Create env files
cp .env.example backend/.env
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3001" > frontend/.env.local

# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Verify Installation

```bash
# Health check
curl http://localhost:3001/health

# Analyze an address
curl "http://localhost:3001/api/risk/0x1234567890123456789012345678901234567890"
```

Visit http://localhost:3000 and try the UI!

---

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status and uptime.

### Risk Analysis
```
GET /api/risk/:address
```
Analyzes wallet risk. Returns:
- Overall risk score (0-100)
- Risk level (Very Low, Low, Medium, High, Very High)
- Breakdown by component
- AI explanation

**Example:**
```bash
curl "http://localhost:3001/api/risk/0x1234567890123456789012345678901234567890"
```

**Response:**
```json
{
  "address": "0x123...",
  "riskScore": 45,
  "riskLevel": "Medium",
  "breakdown": {
    "walletRisk": 40,
    "smartContractRisk": 30,
    "liquidityRisk": 55
  },
  "components": {
    "transactionRisk": 40,
    "contractRisk": 30,
    "liquidityRisk": 55,
    "behavioralRisk": 25
  },
  "explanation": {
    "summary": "Address shows moderate risk...",
    "keyFindings": [...],
    "recommendations": [...],
    "riskFactors": [...]
  },
  "timestamp": "2024-02-16T10:30:00Z"
}
```

**[📖 Full API Documentation →](API.md)**

---

## 🧠 Risk Scoring Algorithm

SafeLayer uses a **weighted aggregation model**:

| Component | Weight | Description |
|-----------|--------|-------------|
| Wallet Risk | 30% | Transaction history, account age, balance |
| Smart Contract Risk | 25% | Verification status, vulnerabilities |
| Liquidity Risk | 25% | Pool health, token distribution |
| Behavioral Risk | 20% | Transaction patterns, anomalies |

### Risk Levels
- **0-20**: Very Low ✅ - Safe address
- **20-40**: Low ✅ - Acceptable profile
- **40-60**: Medium ⚠️ - Caution advised
- **60-80**: High ⚠️ - Significant risk
- **80-100**: Very High ❌ - Extreme caution

---

## 🧪 Testing

### Run Tests
```bash
cd backend
npm test                 # Run once
npm test:watch          # Watch mode
npm test:coverage       # With coverage report
```

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test risk analysis
curl "http://localhost:3001/api/risk/0x1234567890123456789012345678901234567890"

# In browser
open http://localhost:3000
```

---

## 🐳 Docker Setup

### Commands

```bash
# Start all services
docker-compose up

# Start with rebuild
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View backend logs
docker-compose logs -f backend

# Full reset (remove volumes)
docker-compose down -v
```

Includes: Frontend, Backend, PostgreSQL database

**[📖 Full Docker Guide →](DOCKER.md)**

---

## 🔨 Development

### Common Commands

```bash
# Frontend development
cd frontend && npm run dev

# Backend development
cd backend && npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Using Makefile
make help           # Show all commands
make install        # Install dependencies
make dev            # Start dev servers
make test           # Run tests
make docker-up      # Start Docker
```

### Project Layout

- **Modular architecture** - Each risk factor is a separate module
- **Clean separation** - Frontend/backend clearly separated
- **Type-safe** - Full TypeScript throughout
- **Well-tested** - Jest tests for core logic
- **Documented** - Comprehensive docs and comments

**[📖 Full Development Guide →](DEVELOPMENT.md)**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup guide |
| [API.md](API.md) | API endpoint documentation |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Dev guide and architecture |
| [DOCKER.md](DOCKER.md) | Docker setup and commands |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

---

## 🚀 Deployment

### Quick Deploy

**Heroku:**
```bash
heroku create safelayer-bnb
git push heroku main
```

**Vercel (Frontend):**
1. Push to GitHub
2. Import in Vercel
3. Set `NEXT_PUBLIC_BACKEND_URL` env var
4. Deploy!

**Docker:**
```bash
docker build -t safelayer-bnb .
docker run -p 3000:3000 -p 3001:3001 safelayer-bnb
```

**[📖 Full Deployment Guide →](DEPLOYMENT.md)**

---

## 🔐 Security

- Express CORS configured
- Input validation on all endpoints
- No secrets in code (use .env)
- SQL injection protection via parameterized queries
- Rate limiting ready (add middleware)
- Error messages don't leak internals

For production:
1. Use HTTPS/SSL
2. Add API authentication
3. Enable rate limiting
4. Set up monitoring
5. Regular security audits

---

## 📊 Monitoring & Logging

### Logs
- **Combined**: `backend/logs/combined.log`
- **Errors only**: `backend/logs/error.log`
- **Real-time**: `docker-compose logs -f backend`

### Log Levels
- `error` - Critical issues
- `warn` - Warnings
- `info` - General info (default)
- `debug` - Detailed debugging

Set via `LOG_LEVEL` env var.

---

## 🔄 CI/CD

GitHub Actions automatically:
- Runs tests on every push
- Type-checks code
- Builds Docker images
- Can deploy to your server

See `.github/workflows/ci-cd.yml`

---

## 🎯 Roadmap

### Phase 1 (Current MVP) ✅
- [x] Basic risk scoring
- [x] API endpoints
- [x] Frontend UI
- [x] Docker setup
- [x] Tests
- [x] Documentation

### Phase 2 (Next Steps)
- [ ] Real blockchain integration (RPC calls)
- [ ] PostgreSQL persistence
- [ ] Advanced risk heuristics
- [ ] Caching (Redis)
- [ ] User authentication
- [ ] Historical tracking

### Phase 3 (Future)
- [ ] ML-based risk scoring
- [ ] Multi-chain support
- [ ] Browser extension
- [ ] Mobile app
- [ ] API webhooks
- [ ] Batch analysis

---

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md)

Quick steps:
1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Make changes and test
4. Submit a pull request

Areas needing help:
- Real blockchain data integration
- Additional risk factors
- UI/UX improvements
- Performance optimization
- Testing improvements

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## ❓ FAQ

**Q: Can I use real blockchain data?**
A: Yes! Replace mock implementations with Ethers.js RPC calls. See [DEVELOPMENT.md](DEVELOPMENT.md)

**Q: How do I add a new risk factor?**
A: Create a new module in `backend/src/modules/`, integrate into aggregator. See [DEVELOPMENT.md](DEVELOPMENT.md)

**Q: Is this production-ready?**
A: MVP is hackathon-ready. For production, add auth, monitoring, caching, and real data sources.

**Q: Can I deploy this?**
A: Yes! See [DEPLOYMENT.md](DEPLOYMENT.md) for Heroku, AWS, DigitalOcean, etc.

**Q: How do I test?**
A: Any valid Ethereum address works (e.g., `0x1234567890123456789012345678901234567890`)

---

## 📞 Support

- 📖 Read the docs in `/docs`
- 🐛 Report bugs in GitHub Issues
- 💬 Ask questions in Discussions
- Check existing code in `/modules` for examples

---

## 🎉 Credit

Built for the BNB Chain Risk Intelligence Hackathon.

**Tech Stack:**
- Frontend: Next.js, TailwindCSS, Axios
- Backend: Express, TypeScript, Winston
- DevOps: Docker, GitHub Actions
- Blockchain: Ethers.js, BNB RPC

---

**Happy hacking!** 🚀

For quick start, run: `make help` or `bash setup.sh`
