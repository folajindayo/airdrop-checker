/**
 * Tests for /api/wallet-clustering/[address] route
 */

import { GET } from '@/app/api/wallet-clustering/[address]/route';
import { createMockRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/wallet-clustering/[address]', () => {
  describe('GET', () => {
    it('should get wallet clustering data for address', async () => {
      const request = createMockRequest(`/api/wallet-clustering/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('relatedWallets');
    });

    it('should return validation error for invalid address', async () => {
      const request = createMockRequest('/api/wallet-clustering/invalid-address');
      const params = { address: 'invalid-address' };

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should include related wallets', async () => {
      const request = createMockRequest(`/api/wallet-clustering/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(Array.isArray(json.relatedWallets)).toBe(true);
    });

    it('should include clusters', async () => {
      const request = createMockRequest(`/api/wallet-clustering/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('clusters');
      expect(Array.isArray(json.clusters)).toBe(true);
    });

    it('should include funding tree', async () => {
      const request = createMockRequest(`/api/wallet-clustering/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('fundingTree');
    });
  });
});

