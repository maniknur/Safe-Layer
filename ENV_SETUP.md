# Environment Variables Setup Guide

Complete guide untuk setup `.env` files untuk development dan production.

## 🚀 Quick Setup (Development)

### Option 1: Copy Existing Files
```bash
# Backend sudah ada di backend/.env
# Frontend sudah ada di frontend/.env.local

# Langsung jalanin:
docker-compose up
```

### Option 2: Manual Setup from .env.example
```bash
# Backend
cp .env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

---

## 📝 Backend Environment (`backend/.env`)

Semua variables yang dibutuhkan:

```env
# Server
PORT=3001                                    # Port untuk backend
NODE_ENV=development                         # development, production, test
LOG_LEVEL=info                               # error, warn, info, debug

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/safelayer_bnb
DB_POOL_SIZE=10

# CORS
CORS_ORIGIN=http://localhost:3000           # Frontend URL

# Blockchain
BNB_RPC_URL=https://bsc-dataseed.binance.org/
BNB_RPC_TIMEOUT=30000

# AI
AI_MODEL=rule_based
EXPLANATION_DETAIL_LEVEL=detailed

# Security (future)
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

### Untuk Development
```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug                              # Lebih verbose
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://safelayer:password@localhost:5432/safelayer_bnb
```

### Untuk Production
```env
PORT=3001
NODE_ENV=production
LOG_LEVEL=warn                               # Kurangi logs
CORS_ORIGIN=https://yourdomain.com
DATABASE_URL=postgresql://user:secure_pass@prod-db.example.com:5432/safelayer
```

---

## 🎨 Frontend Environment (`frontend/.env.local`)

Variables untuk development:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BNB_RPC_URL=https://bsc-dataseed.binance.org/
```

**Penting**: Semua `NEXT_PUBLIC_*` akan di-embed ke client-side, jadi jangan put secrets!

### Untuk Development (`.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BNB_RPC_URL=https://bsc-dataseed.binance.org/
```

### Untuk Staging (`.env.staging`)
```env
NEXT_PUBLIC_BACKEND_URL=https://staging-api.yourdomain.com
NEXT_PUBLIC_BNB_RPC_URL=https://bsc-dataseed.binance.org/
```

### Untuk Production (`.env.production`)
```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_BNB_RPC_URL=https://bsc-dataseed.binance.org/
```

---

## 🔑 Environment Variable Explanations

### Backend Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | 3001 | Port untuk server Express |
| `NODE_ENV` | development | Environment mode |
| `LOG_LEVEL` | info | Logging level (error, warn, info, debug) |
| `DATABASE_URL` | postgresql://... | PostgreSQL connection string |
| `CORS_ORIGIN` | http://localhost:3000 | Frontend URL untuk CORS |
| `BNB_RPC_URL` | https://bsc-dataseed... | BNB Chain RPC endpoint |
| `BNB_RPC_TIMEOUT` | 30000 | RPC timeout in milliseconds |
| `AI_MODEL` | rule_based | Risk scoring model type |
| `EXPLANATION_DETAIL_LEVEL` | detailed | Explanation verbosity |

### Frontend Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | http://localhost:3001 | Backend API URL |
| `NEXT_PUBLIC_BNB_RPC_URL` | https://bsc-dataseed... | Direct RPC access (if needed) |

---

## 🐳 Docker Compose Environment

Docker Compose baca variables dari root `.env` atau bisa set langsung di `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      PORT: 3001
      NODE_ENV: development
      CORS_ORIGIN: http://localhost:3000
      DATABASE_URL: postgresql://safelayer:safelayer_password@postgres:5432/safelayer_bnb
```

---

## 🔐 Security Tips

### ✅ Do's
- ✅ Use `.gitignore` untuk exclude `.env` files
- ✅ Keep `.env.example` di repo (tanpa secrets)
- ✅ Use strong passwords di production
- ✅ Rotate secrets regularly
- ✅ Use environment-specific files (`.env.production`, `.env.staging`)

### ❌ Don'ts
- ❌ Commit `.env` files ke git
- ❌ Hardcode secrets di code
- ❌ Share `.env` files di public
- ❌ Use same secrets everywhere
- ❌ Logging sensitive data

---

## 📋 Checklist untuk Development

```
Backend (.env):
  [ ] PORT set ke 3001
  [ ] NODE_ENV = development
  [ ] CORS_ORIGIN = http://localhost:3000
  [ ] DATABASE_URL set (atau comment out untuk mock)
  [ ] BNB_RPC_URL set

Frontend (.env.local):
  [ ] NEXT_PUBLIC_BACKEND_URL = http://localhost:3001
  [ ] NEXT_PUBLIC_BNB_RPC_URL valid
```

## 📋 Checklist untuk Production

```
Backend (.env):
  [ ] NODE_ENV = production
  [ ] CORS_ORIGIN = https://yourdomain.com
  [ ] PORT exposed properly
  [ ] DATABASE_URL pointing to prod DB
  [ ] BNB_RPC_URL tested
  [ ] LOG_LEVEL = warn

Frontend (.env.production):
  [ ] NEXT_PUBLIC_BACKEND_URL = https://api.yourdomain.com
  [ ] No localhost URLs
```

---

## 🧪 Testing Environment Variables

### Check Backend Connection
```bash
cd backend
npm run dev

# Should see:
# SafeLayer BNB Backend running on port 3001
# Environment: development
```

### Check Frontend Connection
```bash
cd frontend
npm run dev

# Visit http://localhost:3000
# Try analyze an address
# Should connect to backend successfully
```

### Check Database (optional)
```bash
psql $DATABASE_URL
# If connected successfully, you can proceed with migrations
```

---

## 🚨 Common Issues

### Backend won't start
**Problem**: "listen EADDRINUSE :::3001"
**Solution**: 
```bash
# Change port in .env
PORT=3002

# Or kill process on 3001
lsof -i :3001
kill -9 <PID>
```

### Frontend can't reach backend
**Problem**: "Failed to fetch"
**Solution**:
```bash
# Check NEXT_PUBLIC_BACKEND_URL
cat frontend/.env.local

# Make sure backend is running
curl http://localhost:3001/health
```

### Database connection fails
**Problem**: "could not connect to server"
**Solution**:
```bash
# Check DATABASE_URL format
# psql postgresql://user:password@host:port/dbname

# Or use Docker
docker-compose up postgres
```

---

## 📚 Example Configurations

### Local Development with Docker
```bash
# docker-compose.yml automatically sets:
# - Backend: CORS_ORIGIN=http://localhost:3000
# - Database: PostgreSQL local
# Just run:
docker-compose up
```

### Local Development Manual
```env
# backend/.env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://localhost/safelayer_bnb

# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Production AWS
```env
# backend/.env.production
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://app.yourdomain.com
DATABASE_URL=postgresql://user:pass@prod-db.aws.com:5432/safelayer

# frontend/.env.production
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

### Production Heroku
```bash
# Set via Heroku CLI:
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://yourapp.herokuapp.com
heroku config:set DATABASE_URL=...
# etc
```

---

## 🔄 Switching Between Environments

### Development
```bash
npm run dev
# Uses .env (backend) dan .env.local (frontend)
```

### Production
```bash
npm run build
npm start

# Frontend uses .env.production
# Backend uses .env with NODE_ENV=production
```

### Testing
```bash
NODE_ENV=test npm test
```

---

## 💡 Tips

1. **Version Control**: Keep `.env.example` updated saat add new variables
2. **Documentation**: Document semua variables di file ini
3. **Defaults**: Provide sensible defaults di example file
4. **Secrets**: Use secret management tool untuk production (AWS Secrets Manager, Vault, etc)
5. **Rotation**: Rotate secrets regularly di production

---

**Sudah siap mulai! Run `docker-compose up` atau `bash setup.sh`**
