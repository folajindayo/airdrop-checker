/**
 * Tests for WalletHealthService
 */

import { getWalletHealth } from '@/lib/services/wallet-health.service';
import { MOCK_ADDRESS } from '../helpers';

describe('WalletHealthService', () => {
  describe('getWalletHealth', () => {
    it('should get wallet health data for valid address', async () => {
      const result = await getWalletHealth(MOCK_ADDRESS);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('healthScore');
    });

    it('should return normalized address', async () => {
      const upperCaseAddress = MOCK_ADDRESS.toUpperCase();
      const result = await getWalletHealth(upperCaseAddress);

      expect(result.address).toBe(MOCK_ADDRESS.toLowerCase());
    });

    it('should include health score with metrics', async () => {
      const result = await getWalletHealth(MOCK_ADDRESS);

      expect(result.healthScore).toBeDefined();
      expect(result.healthScore).toHaveProperty('overall');
      expect(result.healthScore).toHaveProperty('metrics');
      expect(Array.isArray(result.healthScore.metrics)).toBe(true);
    });

    it('should calculate overall score between 0 and 100', async () => {
      const result = await getWalletHealth(MOCK_ADDRESS);

      expect(typeof result.healthScore.overall).toBe('number');
      expect(result.healthScore.overall).toBeGreaterThanOrEqual(0);
      expect(result.healthScore.overall).toBeLessThanOrEqual(100);
    });

    it('should include recommendations', async () => {
      const result = await getWalletHealth(MOCK_ADDRESS);

      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});

