import { analyzeLiquidity, detectLiquidityAnomalies, LiquidityMetrics } from '../modules/liquidity/liquidityAnalyzer';

// These tests use real BNB Chain RPC calls
const TEST_EOA = '0x1234567890123456789012345678901234567890';
// BUSD token - a well-known token with PancakeSwap pair
const TEST_TOKEN = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';

describe('Liquidity Analyzer Module', () => {
  describe('analyzeLiquidity', () => {
    it('should return valid LiquidityMetrics for EOA', async () => {
      const metrics = await analyzeLiquidity(TEST_EOA);

      expect(metrics).toHaveProperty('tokenLiquidity');
      expect(metrics).toHaveProperty('liquidityRatio');
      expect(metrics).toHaveProperty('chainConcentration');
      expect(metrics).toHaveProperty('rugPullRisk');
      expect(metrics).toHaveProperty('riskScore');
      expect(metrics).toHaveProperty('hasPancakeswapPair');
      expect(metrics).toHaveProperty('liquidityBNB');
      expect(metrics).toHaveProperty('tokenSymbol');
    }, 15000);

    it('should return risk score between 0 and 100', async () => {
      const metrics = await analyzeLiquidity(TEST_EOA);

      expect(metrics.riskScore).toBeGreaterThanOrEqual(0);
      expect(metrics.riskScore).toBeLessThanOrEqual(100);
      expect(metrics.rugPullRisk).toBeGreaterThanOrEqual(0);
      expect(metrics.rugPullRisk).toBeLessThanOrEqual(100);
    }, 15000);

    it('should handle EOA without PancakeSwap pair', async () => {
      const metrics = await analyzeLiquidity(TEST_EOA);

      expect(metrics.hasPancakeswapPair).toBe(false);
      expect(metrics.tokenSymbol).toBe('BNB');
    }, 15000);

    it('should detect PancakeSwap pair for known tokens', async () => {
      const metrics = await analyzeLiquidity(TEST_TOKEN);

      expect(metrics.hasPancakeswapPair).toBe(true);
      expect(metrics.tokenSymbol).not.toBe('UNKNOWN');
      expect(parseFloat(metrics.liquidityBNB)).toBeGreaterThan(0);
    }, 30000);

    it('should return consistent results', async () => {
      const metrics1 = await analyzeLiquidity(TEST_EOA);
      const metrics2 = await analyzeLiquidity(TEST_EOA);

      expect(metrics1.hasPancakeswapPair).toBe(metrics2.hasPancakeswapPair);
      expect(metrics1.tokenSymbol).toBe(metrics2.tokenSymbol);
    }, 20000);
  });

  describe('detectLiquidityAnomalies', () => {
    it('should return an array', async () => {
      const anomalies = await detectLiquidityAnomalies(TEST_EOA);

      expect(Array.isArray(anomalies)).toBe(true);
    }, 15000);

    it('should return strings in the array', async () => {
      const anomalies = await detectLiquidityAnomalies(TEST_EOA);

      anomalies.forEach(anomaly => {
        expect(typeof anomaly).toBe('string');
        expect(anomaly.length).toBeGreaterThan(0);
      });
    }, 15000);

    it('should detect no pair for EOA addresses', async () => {
      const anomalies = await detectLiquidityAnomalies(TEST_EOA);

      // EOA should not have a PancakeSwap pair
      expect(anomalies.some(a => a.includes('No PancakeSwap'))).toBe(true);
    }, 15000);
  });
});
