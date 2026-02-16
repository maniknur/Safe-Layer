import { generateExplanation } from '../modules/ai/explanationGenerator';
import { RiskScore } from '../modules/aggregator/riskScorer';

function mockScore(overrides: Partial<RiskScore> = {}): RiskScore {
  return {
    overallScore: 50,
    walletRisk: 30,
    smartContractRisk: 40,
    liquidityRisk: 35,
    rugPullRisk: 20,
    components: {
      transactionRisk: 30,
      contractRisk: 40,
      liquidityRisk: 35,
      behavioralRisk: 25,
    },
    flags: [],
    addressType: 'wallet',
    ...overrides,
  };
}

const TEST_ADDR = '0x1234567890123456789012345678901234567890';
const TEST_ADDR2 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

describe('Explanation Generator Module', () => {
  describe('generateExplanation', () => {
    it('should return a valid RiskExplanation object', async () => {
      const explanation = await generateExplanation(mockScore(), TEST_ADDR);
      expect(explanation).toHaveProperty('summary');
      expect(explanation).toHaveProperty('keyFindings');
      expect(explanation).toHaveProperty('recommendations');
      expect(explanation).toHaveProperty('riskFactors');
    });

    it('should have all properties as expected types', async () => {
      const explanation = await generateExplanation(mockScore({ overallScore: 25 }), TEST_ADDR2);
      expect(typeof explanation.summary).toBe('string');
      expect(Array.isArray(explanation.keyFindings)).toBe(true);
      expect(Array.isArray(explanation.recommendations)).toBe(true);
      expect(Array.isArray(explanation.riskFactors)).toBe(true);
    });

    it('should include address abbreviation in summary', async () => {
      const explanation = await generateExplanation(mockScore({ overallScore: 45 }), TEST_ADDR);
      expect(explanation.summary).toContain('0x1234');
    });

    it('should generate text for low risk score', async () => {
      const explanation = await generateExplanation(
        mockScore({ overallScore: 10, walletRisk: 5, smartContractRisk: 10, liquidityRisk: 8, rugPullRisk: 0 }),
        TEST_ADDR2
      );
      expect(explanation.summary.toLowerCase()).toContain('strong security');
      expect(explanation.recommendations.some(r => r.includes('safe') || r.includes('monitor'))).toBe(true);
    });

    it('should generate text for moderate risk score', async () => {
      const explanation = await generateExplanation(
        mockScore({ overallScore: 50, walletRisk: 45, smartContractRisk: 55, liquidityRisk: 50 }),
        TEST_ADDR2
      );
      expect(explanation.summary.toLowerCase()).toContain('moderate');
    });

    it('should generate text for high risk score', async () => {
      const explanation = await generateExplanation(
        mockScore({ overallScore: 85, walletRisk: 80, smartContractRisk: 90, liquidityRisk: 85, rugPullRisk: 70 }),
        TEST_ADDR2
      );
      expect(explanation.summary.toLowerCase()).toContain('high-risk');
    });

    it('should always have at least one recommendation', async () => {
      const explanation = await generateExplanation(mockScore({ overallScore: 35 }), TEST_ADDR);
      expect(explanation.recommendations.length).toBeGreaterThan(0);
    });

    it('should always have at least one key finding', async () => {
      const explanation = await generateExplanation(mockScore({ overallScore: 15 }), TEST_ADDR2);
      expect(explanation.keyFindings.length).toBeGreaterThan(0);
    });
  });

  describe('Risk Component Flags', () => {
    it('should flag wallet risk when over 50', async () => {
      const explanation = await generateExplanation(mockScore({ walletRisk: 65 }), TEST_ADDR);
      expect(explanation.keyFindings.some(f => f.includes('Wallet') || f.includes('wallet'))).toBe(true);
    });

    it('should flag smart contract risk when over 50', async () => {
      const explanation = await generateExplanation(mockScore({ smartContractRisk: 75 }), TEST_ADDR2);
      expect(explanation.keyFindings.some(f => f.toLowerCase().includes('contract'))).toBe(true);
    });

    it('should flag liquidity risk when over 50', async () => {
      const explanation = await generateExplanation(mockScore({ liquidityRisk: 72 }), TEST_ADDR2);
      expect(explanation.keyFindings.some(f => f.toLowerCase().includes('liquidity'))).toBe(true);
    });

    it('should flag rug pull risk when high', async () => {
      const explanation = await generateExplanation(mockScore({ rugPullRisk: 65 }), TEST_ADDR);
      expect(explanation.keyFindings.some(f => f.toLowerCase().includes('rug pull'))).toBe(true);
    });
  });

  describe('Address Type Context', () => {
    it('should mention wallet for EOA addresses', async () => {
      const explanation = await generateExplanation(mockScore({ addressType: 'wallet' }), TEST_ADDR);
      expect(explanation.keyFindings.some(f => f.includes('wallet') || f.includes('externally owned'))).toBe(true);
    });

    it('should mention token for token addresses', async () => {
      const explanation = await generateExplanation(mockScore({ addressType: 'token' }), TEST_ADDR);
      expect(explanation.keyFindings.some(f => f.includes('token') || f.includes('PancakeSwap'))).toBe(true);
    });

    it('should mention contract for contract addresses', async () => {
      const explanation = await generateExplanation(mockScore({ addressType: 'contract' }), TEST_ADDR);
      expect(explanation.keyFindings.some(f => f.toLowerCase().includes('contract'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero risk', async () => {
      const explanation = await generateExplanation(
        mockScore({ overallScore: 0, walletRisk: 0, smartContractRisk: 0, liquidityRisk: 0, rugPullRisk: 0 }),
        TEST_ADDR2
      );
      expect(explanation.summary.length).toBeGreaterThan(10);
      expect(explanation.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle maximum risk', async () => {
      const explanation = await generateExplanation(
        mockScore({
          overallScore: 100, walletRisk: 100, smartContractRisk: 100, liquidityRisk: 100, rugPullRisk: 100,
          flags: ['Critical vulnerability', 'Known scam'],
        }),
        TEST_ADDR
      );
      expect(explanation.summary.toLowerCase()).toMatch(/high|extreme|caution/);
    });

    it('should include flags in findings', async () => {
      const explanation = await generateExplanation(
        mockScore({ flags: ['Proxy contract detected', 'Low liquidity'] }),
        TEST_ADDR
      );
      expect(explanation.keyFindings.some(f => f.includes('indicator'))).toBe(true);
    });

    it('should generate meaningful summaries', async () => {
      const explanation = await generateExplanation(mockScore({ overallScore: 45 }), TEST_ADDR2);
      expect(explanation.summary.length).toBeGreaterThan(20);
      expect(explanation.summary).toContain('0xabcd');
    });
  });
});
