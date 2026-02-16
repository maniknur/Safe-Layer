import request from 'supertest';
import app from '../app';

// Real BNB Chain addresses for testing
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const VALID_WALLET = '0x1234567890123456789012345678901234567890';

describe('GET /api/risk/:address - Integration Tests', () => {
  describe('Valid BNB contract address', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app)
        .get(`/api/risk/${PANCAKE_ROUTER}`)
        .expect('Content-Type', /json/);
    }, 30000);

    it('should return 200 status', () => {
      expect(response.status).toBe(200);
    });

    it('should return success true', () => {
      expect(response.body.success).toBe(true);
    });

    it('should return the normalized address', () => {
      expect(response.body.address).toBe(PANCAKE_ROUTER.toLowerCase());
    });

    it('should contain overallScore (riskScore)', () => {
      expect(response.body).toHaveProperty('riskScore');
      expect(typeof response.body.riskScore).toBe('number');
      expect(response.body.riskScore).toBeGreaterThanOrEqual(0);
      expect(response.body.riskScore).toBeLessThanOrEqual(100);
    });

    it('should contain walletRisk in breakdown', () => {
      expect(response.body.breakdown).toHaveProperty('walletRisk');
      expect(typeof response.body.breakdown.walletRisk).toBe('number');
    });

    it('should contain contractRisk (smartContractRisk) in breakdown', () => {
      expect(response.body.breakdown).toHaveProperty('smartContractRisk');
      expect(typeof response.body.breakdown.smartContractRisk).toBe('number');
    });

    it('should contain liquidityRisk in breakdown', () => {
      expect(response.body.breakdown).toHaveProperty('liquidityRisk');
      expect(typeof response.body.breakdown.liquidityRisk).toBe('number');
    });

    it('should contain rugProbability (rugPullRisk)', () => {
      expect(response.body).toHaveProperty('rugPullRisk');
      expect(typeof response.body.rugPullRisk).toBe('number');
    });

    it('should contain explanation object', () => {
      expect(response.body).toHaveProperty('explanation');
      expect(response.body.explanation).toHaveProperty('summary');
      expect(response.body.explanation).toHaveProperty('keyFindings');
      expect(response.body.explanation).toHaveProperty('recommendations');
      expect(response.body.explanation).toHaveProperty('riskFactors');
    });

    it('should contain riskLevel string', () => {
      expect(response.body).toHaveProperty('riskLevel');
      expect(['Very Low', 'Low', 'Medium', 'High', 'Very High']).toContain(response.body.riskLevel);
    });

    it('should contain addressType', () => {
      expect(response.body).toHaveProperty('addressType');
      expect(['wallet', 'contract', 'token']).toContain(response.body.addressType);
    });

    it('should contain components breakdown', () => {
      expect(response.body).toHaveProperty('components');
      expect(response.body.components).toHaveProperty('transactionRisk');
      expect(response.body.components).toHaveProperty('contractRisk');
      expect(response.body.components).toHaveProperty('liquidityRisk');
      expect(response.body.components).toHaveProperty('behavioralRisk');
    });

    it('should contain flags array', () => {
      expect(response.body).toHaveProperty('flags');
      expect(Array.isArray(response.body.flags)).toBe(true);
    });

    it('should contain timestamp', () => {
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should contain analysisTimeMs', () => {
      expect(response.body).toHaveProperty('analysisTimeMs');
      expect(typeof response.body.analysisTimeMs).toBe('number');
      expect(response.body.analysisTimeMs).toBeGreaterThan(0);
    });
  });

  describe('Valid wallet address', () => {
    it('should return 200 with valid structure', async () => {
      const response = await request(app)
        .get(`/api/risk/${VALID_WALLET}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('riskScore');
      expect(response.body).toHaveProperty('breakdown');
      expect(response.body).toHaveProperty('explanation');
      expect(response.body).toHaveProperty('rugPullRisk');
    }, 30000);
  });

  describe('Invalid address', () => {
    it('should return 400 for non-hex address', async () => {
      const response = await request(app)
        .get('/api/risk/not-a-valid-address')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for too-short address', async () => {
      const response = await request(app)
        .get('/api/risk/0x1234')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for too-long address', async () => {
      const response = await request(app)
        .get('/api/risk/0x12345678901234567890123456789012345678901234')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for non-hex characters', async () => {
      const response = await request(app)
        .get('/api/risk/0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing 0x prefix', async () => {
      const response = await request(app)
        .get('/api/risk/1234567890123456789012345678901234567890')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Empty address', () => {
    it('should return 404 for empty address with trailing slash', async () => {
      const response = await request(app)
        .get('/api/risk/');

      expect(response.status).toBe(404);
    });

    it('should return 404 for bare risk path', async () => {
      const response = await request(app)
        .get('/api/risk');

      expect(response.status).toBe(404);
    });
  });

  describe('Response format verification', () => {
    it('should return application/json content type', async () => {
      await request(app)
        .get(`/api/risk/${VALID_WALLET}`)
        .expect('Content-Type', /application\/json/);
    }, 30000);

    it('should contain all required fields for contractRisk', async () => {
      const response = await request(app)
        .get(`/api/risk/${PANCAKE_ROUTER}`)
        .expect(200);

      expect(typeof response.body.breakdown.smartContractRisk).toBe('number');
      expect(response.body.breakdown.smartContractRisk).toBeGreaterThanOrEqual(0);
      expect(response.body.breakdown.smartContractRisk).toBeLessThanOrEqual(100);
    }, 30000);

    it('should contain all required fields for walletRisk', async () => {
      const response = await request(app)
        .get(`/api/risk/${PANCAKE_ROUTER}`)
        .expect(200);

      expect(typeof response.body.breakdown.walletRisk).toBe('number');
      expect(response.body.breakdown.walletRisk).toBeGreaterThanOrEqual(0);
      expect(response.body.breakdown.walletRisk).toBeLessThanOrEqual(100);
    }, 30000);

    it('should contain all required fields for liquidityRisk', async () => {
      const response = await request(app)
        .get(`/api/risk/${PANCAKE_ROUTER}`)
        .expect(200);

      expect(typeof response.body.breakdown.liquidityRisk).toBe('number');
      expect(response.body.breakdown.liquidityRisk).toBeGreaterThanOrEqual(0);
      expect(response.body.breakdown.liquidityRisk).toBeLessThanOrEqual(100);
    }, 30000);

    it('should have explanation with non-empty summary', async () => {
      const response = await request(app)
        .get(`/api/risk/${PANCAKE_ROUTER}`)
        .expect(200);

      expect(response.body.explanation.summary.length).toBeGreaterThan(10);
      expect(response.body.explanation.keyFindings.length).toBeGreaterThan(0);
      expect(response.body.explanation.recommendations.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Address normalization', () => {
    it('should normalize mixed-case addresses', async () => {
      const mixedCase = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
      const response = await request(app)
        .get(`/api/risk/${mixedCase}`)
        .expect(200);

      expect(response.body.address).toBe(mixedCase.toLowerCase());
    }, 30000);
  });

  describe('Unknown routes', () => {
    it('should return 404 for unknown API routes', async () => {
      await request(app)
        .get('/api/unknown')
        .expect(404);
    });
  });
});
