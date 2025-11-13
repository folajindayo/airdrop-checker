/**
 * Tests for /api/onchain/gas-estimation route
 */

import { POST } from '@/app/api/onchain/gas-estimation/route';
import { createMockRequestWithBody } from '../helpers';

describe('/api/onchain/gas-estimation', () => {
  describe('POST', () => {
    it('should estimate gas for transaction', async () => {
      const request = createMockRequestWithBody('/api/onchain/gas-estimation', {
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        data: '0x',
        value: '0',
        chainId: 1,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('gasEstimate');
    });

    it('should return validation error for missing required fields', async () => {
      const request = createMockRequestWithBody('/api/onchain/gas-estimation', {
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        // Missing to, data, value, chainId
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });
  });
});

