/**
 * Tests for WalletHealthService
 */

import { assessWalletHealth } from '@/lib/services/wallet-health.service';
import { MOCK_ADDRESS } from '../helpers';

describe('WalletHealthService', () => {
  describe('assessWalletHealth', () => {
    it('should assess wallet health for valid address', async () => {
      const result = await assessWalletHealth(MOCK_ADDRESS);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('healthScore');
    });

    it('should return normalized address', async () => {
      const upperCaseAddress = MOCK_ADDRESS.toUpperCase();
      const result = await assessWalletHealth(upperCaseAddress);

      expect(result.address).toBe(MOCK_ADDRESS.toLowerCase());
    });

    it('should calculate health score between 0 and 100', async () => {
      const result = await assessWalletHealth(MOCK_ADDRESS);

      expect(typeof result.healthScore).toBe('number');
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    it('should include metrics', async () => {
      const result = await assessWalletHealth(MOCK_ADDRESS);

      expect(result).toHaveProperty('metrics');
      expect(result.metrics).toHaveProperty('uniqueTokens');
      expect(result.metrics).toHaveProperty('uniqueChains');
      expect(result.metrics).toHaveProperty('transactionCount');
    });

    it('should include recommendations', async () => {
      const result = await assessWalletHealth(MOCK_ADDRESS);

      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});

