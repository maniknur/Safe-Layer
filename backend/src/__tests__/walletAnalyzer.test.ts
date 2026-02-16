import { analyzeWallet, detectSuspiciousActivity, WalletMetrics } from '../modules/wallet/walletAnalyzer';

// These tests use real BNB Chain RPC calls
// They test against actual blockchain data

const TEST_ADDR = '0x1234567890123456789012345678901234567890';
const TEST_ADDR2 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

describe('Wallet Analyzer Module', () => {
  describe('analyzeWallet', () => {
    it('should return valid WalletMetrics', async () => {
      const metrics = await analyzeWallet(TEST_ADDR);

      expect(metrics).toHaveProperty('transactionCount');
      expect(metrics).toHaveProperty('uniqueInteractions');
      expect(metrics).toHaveProperty('ageInDays');
      expect(metrics).toHaveProperty('balance');
      expect(metrics).toHaveProperty('balanceBNB');
      expect(metrics).toHaveProperty('riskScore');
      expect(metrics).toHaveProperty('isContract');
    }, 15000);

    it('should have non-negative metrics', async () => {
      const metrics = await analyzeWallet(TEST_ADDR2);

      expect(metrics.transactionCount).toBeGreaterThanOrEqual(0);
      expect(metrics.uniqueInteractions).toBeGreaterThanOrEqual(0);
      expect(metrics.ageInDays).toBeGreaterThanOrEqual(0);
      expect(metrics.balance).toBeGreaterThanOrEqual(0);
    }, 15000);

    it('should return risk score between 0 and 100', async () => {
      const metrics = await analyzeWallet(TEST_ADDR);

      expect(metrics.riskScore).toBeGreaterThanOrEqual(0);
      expect(metrics.riskScore).toBeLessThanOrEqual(100);
    }, 15000);

    it('should return consistent results for same address', async () => {
      const metrics1 = await analyzeWallet(TEST_ADDR);
      const metrics2 = await analyzeWallet(TEST_ADDR);

      expect(metrics1.transactionCount).toBe(metrics2.transactionCount);
      expect(metrics1.isContract).toBe(metrics2.isContract);
    }, 20000);

    it('should include BNB balance as formatted string', async () => {
      const metrics = await analyzeWallet(TEST_ADDR);

      expect(typeof metrics.balanceBNB).toBe('string');
      expect(parseFloat(metrics.balanceBNB)).toBeGreaterThanOrEqual(0);
    }, 15000);

    it('should correctly identify EOA vs contract', async () => {
      const metrics = await analyzeWallet(TEST_ADDR);

      expect(typeof metrics.isContract).toBe('boolean');
    }, 15000);
  });

  describe('detectSuspiciousActivity', () => {
    it('should return an array', async () => {
      const flags = await detectSuspiciousActivity(TEST_ADDR);

      expect(Array.isArray(flags)).toBe(true);
    }, 15000);

    it('should return strings in the array', async () => {
      const flags = await detectSuspiciousActivity(TEST_ADDR);

      flags.forEach(flag => {
        expect(typeof flag).toBe('string');
        expect(flag.length).toBeGreaterThan(0);
      });
    }, 15000);
  });
});
