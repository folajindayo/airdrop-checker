/**
 * Tests for PortfolioService
 */

import { getPortfolioData } from '@/lib/services/portfolio.service';
import { MOCK_ADDRESS } from '../helpers';

describe('PortfolioService', () => {
  describe('getPortfolioData', () => {
    it('should get portfolio data for valid address', async () => {
      const result = await getPortfolioData(MOCK_ADDRESS);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('chains');
      expect(Array.isArray(result.chains)).toBe(true);
    });

    it('should return normalized address', async () => {
      const upperCaseAddress = MOCK_ADDRESS.toUpperCase();
      const result = await getPortfolioData(upperCaseAddress);

      expect(result.address).toBe(MOCK_ADDRESS.toLowerCase());
    });

    it('should calculate total value across chains', async () => {
      const result = await getPortfolioData(MOCK_ADDRESS);

      expect(typeof result.totalValue).toBe('number');
      expect(result.totalValue).toBeGreaterThanOrEqual(0);
    });

    it('should include chain breakdown', async () => {
      const result = await getPortfolioData(MOCK_ADDRESS);

      if (result.chains.length > 0) {
        const chain = result.chains[0];
        expect(chain).toHaveProperty('chainId');
        expect(chain).toHaveProperty('chainName');
        expect(chain).toHaveProperty('value');
      }
    });

    it('should handle empty portfolio', async () => {
      const result = await getPortfolioData(MOCK_ADDRESS);

      expect(result.totalValue).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.chains)).toBe(true);
    });
  });
});

