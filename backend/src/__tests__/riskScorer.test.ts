import { getRiskJustification, getRiskLevel } from '../modules/aggregator/riskScorer';
import { isValidAddress, normalizeAddress } from '../utils/validation';

describe('Risk Scorer Utilities', () => {
  describe('getRiskLevel', () => {
    it('should return Very Low for scores under 20', () => {
      expect(getRiskLevel(0)).toBe('Very Low');
      expect(getRiskLevel(10)).toBe('Very Low');
      expect(getRiskLevel(19)).toBe('Very Low');
    });

    it('should return Low for scores 20-39', () => {
      expect(getRiskLevel(20)).toBe('Low');
      expect(getRiskLevel(30)).toBe('Low');
      expect(getRiskLevel(39)).toBe('Low');
    });

    it('should return Medium for scores 40-59', () => {
      expect(getRiskLevel(40)).toBe('Medium');
      expect(getRiskLevel(50)).toBe('Medium');
      expect(getRiskLevel(59)).toBe('Medium');
    });

    it('should return High for scores 60-79', () => {
      expect(getRiskLevel(60)).toBe('High');
      expect(getRiskLevel(70)).toBe('High');
      expect(getRiskLevel(79)).toBe('High');
    });

    it('should return Very High for scores 80+', () => {
      expect(getRiskLevel(80)).toBe('Very High');
      expect(getRiskLevel(90)).toBe('Very High');
      expect(getRiskLevel(100)).toBe('Very High');
    });
  });

  describe('getRiskJustification', () => {
    it('should return appropriate justifications for different scores', () => {
      expect(getRiskJustification(10)).toContain('low risk');
      expect(getRiskJustification(30)).toContain('acceptable');
      expect(getRiskJustification(50)).toContain('moderate risk');
      expect(getRiskJustification(70)).toContain('significant risk');
      expect(getRiskJustification(90)).toContain('high risk');
    });

    it('should provide meaningful text', () => {
      const justification = getRiskJustification(50);
      expect(justification.length).toBeGreaterThan(10);
    });
  });
});

describe('Validation', () => {
  describe('isValidAddress', () => {
    it('should accept valid addresses', () => {
      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidAddress('0xabcdefABCDEF1234567890abcdef1234567890ab')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('not-an-address')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('1234567890123456789012345678901234567890')).toBe(false);
      expect(isValidAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toBe(false);
    });

    it('should handle null/undefined-like inputs', () => {
      expect(isValidAddress(null as any)).toBe(false);
      expect(isValidAddress(undefined as any)).toBe(false);
    });

    it('should handle addresses with whitespace', () => {
      expect(isValidAddress(' 0x1234567890123456789012345678901234567890 ')).toBe(true);
    });
  });

  describe('normalizeAddress', () => {
    it('should lowercase the address', () => {
      expect(normalizeAddress('0xABCDEF1234567890ABCDEF1234567890ABCDEF12'))
        .toBe('0xabcdef1234567890abcdef1234567890abcdef12');
    });

    it('should trim whitespace', () => {
      expect(normalizeAddress(' 0x1234567890123456789012345678901234567890 '))
        .toBe('0x1234567890123456789012345678901234567890');
    });
  });
});
