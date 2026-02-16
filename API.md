# SafeLayer BNB - API Documentation

Base URL: `http://localhost:3001` (or your backend URL)

## Endpoints

### Health Check

**GET** `/health`

Check if the backend is running and healthy.

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2024-02-16T10:30:00.000Z",
  "uptime": 1234.567
}
```

---

### Risk Analysis

**GET** `/api/risk/:address`

Analyze the risk profile of a wallet address on BNB Chain.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `address` | string (path) | Yes | Valid Ethereum wallet address (0x followed by 40 hex characters) |

**Response** (200 OK):
```json
{
  "address": "0x1234567890123456789012345678901234567890",
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
    "summary": "Address 0x123456... shows moderate risk that warrants caution.",
    "keyFindings": [
      "Wallet has typical behavioral patterns for new or inactive accounts.",
      "Token liquidity and distribution patterns indicate potential volatility."
    ],
    "recommendations": [
      "Standard security practices recommended.",
      "Consider additional verification for large transactions.",
      "Continue to monitor for any changes in risk profile."
    ],
    "riskFactors": [
      "Limited transaction history",
      "Low or concentrated liquidity pools"
    ]
  },
  "timestamp": "2024-02-16T10:30:00.000Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid address format",
  "message": "Address must be a valid Ethereum address (0x followed by 40 hexadecimal characters)",
  "address": "invalid-address"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Internal Server Error",
  "timestamp": "2024-02-16T10:30:00.000Z"
}
```

---

## Risk Levels

The risk score is between 0 and 100:

| Range | Level | Description |
|-------|-------|-------------|
| 0-20 | Very Low | ✅ Safe address, low risk indicators |
| 20-40 | Low | ✅ Acceptable security profile |
| 40-60 | Medium | ⚠️ Moderate risk, caution advised |
| 60-80 | High | ⚠️ Significant risk issues |
| 80-100 | Very High | ❌ High-risk characteristics |

---

## Risk Components

### Wallet Risk (30% weight)
Evaluates wallet behavior and characteristics:
- Transaction count and history
- Account age (newer = higher risk)
- Balance and transaction patterns
- Unique interactions

### Smart Contract Risk (25% weight)
Evaluates smart contracts associated with the address:
- Contract verification status
- Known vulnerabilities
- Code quality indicators
- Interaction patterns

### Liquidity Risk (25% weight)
Evaluates liquidity and pool health:
- Token liquidity levels
- Liquidity ratio balance
- Pool concentration
- Rug pull probability

### Behavioral Risk (20% weight)
Evaluates transaction and interaction patterns:
- Unusual transaction timing
- Interaction with flagged addresses
- Transfer patterns and anomalies

---

## Example Requests

### cURL

```bash
# Basic health check
curl http://localhost:3001/health

# Analyze a wallet
curl http://localhost:3001/api/risk/0x1234567890123456789012345678901234567890
```

### JavaScript/Fetch

```javascript
// Health check
const health = await fetch('http://localhost:3001/health');
console.log(await health.json());

// Risk analysis
const response = await fetch(
  'http://localhost:3001/api/risk/0x1234567890123456789012345678901234567890'
);
const riskData = await response.json();
console.log(riskData);
```

### Python

```python
import requests

# Health check
health = requests.get('http://localhost:3001/health')
print(health.json())

# Risk analysis
response = requests.get(
    'http://localhost:3001/api/risk/0x1234567890123456789012345678901234567890'
)
risk_data = response.json()
print(risk_data)
```

---

## Rate Limiting

Currently no rate limiting. In production, add rate limiting middleware:
- Suggested: 100 requests per 15 minutes per IP
- See `backend/src/index.ts` for middleware setup

---

## CORS

By default, CORS is enabled for `*`. Configure via `CORS_ORIGIN` environment variable:

```env
CORS_ORIGIN=http://localhost:3000,https://example.com
```

---

## Authentication

Currently no authentication. For production:
1. Add API key validation
2. Add JWT token support
3. Implement role-based access control (RBAC)

---

## Versioning

Current API version: `v1` (implicit)

Future: Support versioned endpoints like `/api/v2/risk/:address` if breaking changes occur.

---

## Error Handling

All errors return JSON with:
- `error`: Error message
- `message`: Detailed description (optional)
- `timestamp`: ISO 8601 timestamp
- `stack`: Stack trace (development only)

---

## Testing the API

### Manual Testing

```bash
# Start backend
cd backend && npm run dev

# In another terminal, test
curl http://localhost:3001/health
curl http://localhost:3001/api/risk/0x1234567890123456789012345678901234567890
```

### Automated Testing

```bash
# Run backend tests
cd backend && npm test

# Run with coverage
npm run test:coverage
```

---

## Performance

- Typical response time: 50-200ms
- All operations are mocked (no actual blockchain calls currently)
- Add caching for real blockchain queries

---

## Monitoring

Logs are stored in `backend/logs/`:
- `combined.log` - All logs
- `error.log` - Errors only

Monitor logs in development:
```bash
docker-compose logs -f backend
```

---

## Future Enhancements

- [ ] Real blockchain integration
- [ ] Database persistence
- [ ] Caching layer (Redis)
- [ ] Rate limiting
- [ ] API authentication/authorization
- [ ] WebSocket for real-time updates
- [ ] Batch risk analysis
- [ ] Historical data and trends
- [ ] Webhook support
