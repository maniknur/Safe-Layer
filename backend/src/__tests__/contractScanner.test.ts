import { scanContract, analyzeContractInteractions, ScanResult } from '../modules/scanner/contractScanner';

// These tests use real BNB Chain RPC calls
const TEST_EOA = '0x1234567890123456789012345678901234567890';
// PancakeSwap Router - a well-known contract on BNB Chain
const TEST_CONTRACT = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

describe('Contract Scanner Module', () => {
  describe('scanContract', () => {
    it('should return valid ScanResult', async () => {
      const result = await scanContract(TEST_EOA);

      expect(result).toHaveProperty('contractAddress');
      expect(result).toHaveProperty('risksFound');
      expect(result).toHaveProperty('riskScore');
      expect(result).toHaveProperty('isVerified');
      expect(result).toHaveProperty('isContract');
      expect(result).toHaveProperty('codeSize');
    }, 15000);

    it('should identify EOA addresses correctly', async () => {
      const result = await scanContract(TEST_EOA);

      // EOA should not be flagged as a contract
      expect(result.isContract).toBe(false);
      expect(result.riskScore).toBe(0);
      expect(result.codeSize).toBe(0);
    }, 15000);

    it('should identify contract addresses correctly', async () => {
      const result = await scanContract(TEST_CONTRACT);

      expect(result.isContract).toBe(true);
      expect(result.codeSize).toBeGreaterThan(0);
    }, 15000);

    it('should return risk score between 0 and 100', async () => {
      const result = await scanContract(TEST_CONTRACT);

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    }, 15000);

    it('should include risks as array of strings', async () => {
      const result = await scanContract(TEST_CONTRACT);

      expect(Array.isArray(result.risksFound)).toBe(true);
      result.risksFound.forEach(risk => {
        expect(typeof risk).toBe('string');
        expect(risk.length).toBeGreaterThan(0);
      });
    }, 15000);

    it('should return consistent results for same address', async () => {
      const result1 = await scanContract(TEST_EOA);
      const result2 = await scanContract(TEST_EOA);

      expect(result1.isContract).toBe(result2.isContract);
      expect(result1.codeSize).toBe(result2.codeSize);
    }, 20000);
  });

  describe('analyzeContractInteractions', () => {
    it('should return a number', async () => {
      const score = await analyzeContractInteractions(TEST_CONTRACT);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }, 15000);
  });
});
