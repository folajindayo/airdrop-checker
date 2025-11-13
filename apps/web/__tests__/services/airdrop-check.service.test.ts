/**
 * Tests for AirdropCheckService
 */

import { checkAirdropEligibility } from '@/lib/services/airdrop-check.service';
import { MOCK_ADDRESS } from '../helpers';

describe('AirdropCheckService', () => {
  describe('checkAirdropEligibility', () => {
    it('should check eligibility for valid address', async () => {
      const result = await checkAirdropEligibility(MOCK_ADDRESS);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('airdrops');
      expect(Array.isArray(result.airdrops)).toBe(true);
    });

    it('should return normalized address', async () => {
      const upperCaseAddress = MOCK_ADDRESS.toUpperCase();
      const result = await checkAirdropEligibility(upperCaseAddress);

      expect(result.address).toBe(MOCK_ADDRESS.toLowerCase());
    });

    it('should calculate overall score', async () => {
      const result = await checkAirdropEligibility(MOCK_ADDRESS);

      expect(typeof result.overallScore).toBe('number');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should include eligibility criteria for each airdrop', async () => {
      const result = await checkAirdropEligibility(MOCK_ADDRESS);

      if (result.airdrops.length > 0) {
        const airdrop = result.airdrops[0];
        expect(airdrop).toHaveProperty('criteria');
        expect(Array.isArray(airdrop.criteria)).toBe(true);
      }
    });

    it('should handle errors gracefully', async () => {
      // Test with invalid address format (service should handle validation)
      await expect(checkAirdropEligibility('invalid')).rejects.toThrow();
    });
  });
});

