/**
 * TokenService Tests
 */

import { tokenService } from '../../lib/services/token.service';

global.fetch = jest.fn();

describe('TokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokenBalances', () => {
    it('fetches token balances successfully', async () => {
      const mockTokens = [
        { address: '0x123', symbol: 'USDC', balance: '1000', value: 1000 },
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ tokens: mockTokens }),
      });

      const result = await tokenService.getTokenBalances('0xabc', 1);
      expect(result).toEqual(mockTokens);
    });

    it('handles fetch errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await tokenService.getTokenBalances('0xabc', 1);
      expect(result).toEqual([]);
    });
  });

  describe('getTokenPrice', () => {
    it('fetches token price', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ price: 1.5 }),
      });

      const result = await tokenService.getTokenPrice('0x123', 1);
      expect(result).toBe(1.5);
    });
  });
});

