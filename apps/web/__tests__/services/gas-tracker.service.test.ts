/**
 * Tests for GasTrackerService
 */

import { getGasTrackerData } from '@/lib/services/gas-tracker.service';
import { MOCK_ADDRESS } from '../helpers';

describe('GasTrackerService', () => {
  describe('getGasTrackerData', () => {
    it('should get gas tracking data for valid address', async () => {
      const result = await getGasTrackerData(MOCK_ADDRESS);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('totalSpent');
      expect(result).toHaveProperty('transactions');
    });

    it('should return normalized address', async () => {
      const upperCaseAddress = MOCK_ADDRESS.toUpperCase();
      const result = await getGasTrackerData(upperCaseAddress);

      expect(result.address).toBe(MOCK_ADDRESS.toLowerCase());
    });

    it('should calculate total gas spent', async () => {
      const result = await getGasTrackerData(MOCK_ADDRESS);

      expect(typeof result.totalSpent).toBe('number');
      expect(result.totalSpent).toBeGreaterThanOrEqual(0);
    });

    it('should include transaction count', async () => {
      const result = await getGasTrackerData(MOCK_ADDRESS);

      expect(typeof result.transactions).toBe('number');
      expect(result.transactions).toBeGreaterThanOrEqual(0);
    });

    it('should include chain breakdown if available', async () => {
      const result = await getGasTrackerData(MOCK_ADDRESS);

      if (result.chains) {
        expect(Array.isArray(result.chains)).toBe(true);
        if (result.chains.length > 0) {
          const chain = result.chains[0];
          expect(chain).toHaveProperty('chainId');
          expect(chain).toHaveProperty('gasSpent');
        }
      }
    });
  });
});

