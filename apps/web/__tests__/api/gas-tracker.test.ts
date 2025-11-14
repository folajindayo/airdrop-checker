/**
 * Tests for /api/gas-tracker/[address] route
 */

import { GET } from '@/app/api/gas-tracker/[address]/route';
import { createAddressRequest, MOCK_ADDRESS } from '../helpers';
import { cache } from '@airdrop-finder/shared';

describe('/api/gas-tracker/[address]', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  describe('GET - Success Cases', () => {
    it('should get gas tracking data for address', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('totalSpent');
      expect(json).toHaveProperty('transactions');
      expect(json).toHaveProperty('timestamp');
    });

    it('should normalize address to lowercase', async () => {
      const upperAddress = MOCK_ADDRESS.toUpperCase();
      const { request, params } = createAddressRequest(upperAddress);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.address).toBe(MOCK_ADDRESS.toLowerCase());
    });

    it('should include gas spending by chain', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(Array.isArray(json.chains)).toBe(true);
      
      if (json.chains && json.chains.length > 0) {
        const chain = json.chains[0];
        expect(chain).toHaveProperty('chainId');
        expect(chain).toHaveProperty('chainName');
        expect(chain).toHaveProperty('gasSpent');
        expect(chain).toHaveProperty('transactionCount');
        expect(chain).toHaveProperty('averageGasPrice');
      }
    });

    it('should calculate total gas spent', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(typeof json.totalSpent).toBe('number');
      expect(json.totalSpent).toBeGreaterThanOrEqual(0);
    });

    it('should include transaction count', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('totalTransactions');
      expect(typeof json.totalTransactions).toBe('number');
      expect(json.totalTransactions).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average gas price', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('averageGasPrice');
      if (json.totalTransactions > 0) {
        expect(typeof json.averageGasPrice).toBe('number');
        expect(json.averageGasPrice).toBeGreaterThan(0);
      }
    });

    it('should sort chains by gas spent descending', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.chains && json.chains.length > 1) {
        for (let i = 0; i < json.chains.length - 1; i++) {
          expect(json.chains[i].gasSpent).toBeGreaterThanOrEqual(
            json.chains[i + 1].gasSpent
          );
        }
      }
    });
  });

  describe('GET - Validation Errors', () => {
    it('should return 400 for invalid address format', async () => {
      const { request, params } = createAddressRequest('invalid-address');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
      expect(json.error).toContain('Invalid');
    });

    it('should return 400 for address without 0x prefix', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS.substring(2));

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should return 400 for address with invalid length', async () => {
      const { request, params } = createAddressRequest('0x123');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should return 400 for address with special characters', async () => {
      const { request, params } = createAddressRequest('0x123abc!@#$%^&*()123456789012345678');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });
  });

  describe('GET - Caching Behavior', () => {
    it('should not mark first request as cached', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json.cached).toBeFalsy();
    });

    it('should cache successful responses', async () => {
      const { request: req1, params: params1 } = createAddressRequest(MOCK_ADDRESS);
      const response1 = await GET(req1, params1);
      const json1 = await response1.json();

      expect(json1.cached).toBeFalsy();

      const { request: req2, params: params2 } = createAddressRequest(MOCK_ADDRESS);
      const response2 = await GET(req2, params2);
      const json2 = await response2.json();

      expect(json2.cached).toBe(true);
    });

    it('should return same data from cache', async () => {
      const { request: req1, params: params1 } = createAddressRequest(MOCK_ADDRESS);
      const response1 = await GET(req1, params1);
      const json1 = await response1.json();

      const { request: req2, params: params2 } = createAddressRequest(MOCK_ADDRESS);
      const response2 = await GET(req2, params2);
      const json2 = await response2.json();

      expect(json2.totalSpent).toBe(json1.totalSpent);
      expect(json2.address).toBe(json1.address);
    });

    it('should cache different addresses separately', async () => {
      const address1 = MOCK_ADDRESS;
      const address2 = '0x' + '2'.repeat(40);

      const { request: req1, params: params1 } = createAddressRequest(address1);
      await GET(req1, params1);

      const { request: req2, params: params2 } = createAddressRequest(address2);
      const response2 = await GET(req2, params2);
      const json2 = await response2.json();

      expect(json2.cached).toBeFalsy();
    });
  });

  describe('GET - Response Format', () => {
    it('should return JSON content type', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should include timestamp in response', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('timestamp');
      expect(typeof json.timestamp).toBe('string');
      expect(new Date(json.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should have consistent chain structure', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.chains && json.chains.length > 0) {
        json.chains.forEach((chain: any) => {
          expect(chain).toHaveProperty('chainId');
          expect(chain).toHaveProperty('chainName');
          expect(chain).toHaveProperty('gasSpent');
          expect(chain).toHaveProperty('transactionCount');
          expect(chain).toHaveProperty('averageGasPrice');
        });
      }
    });
  });

  describe('GET - Edge Cases', () => {
    it('should handle address with no transactions', async () => {
      const newAddress = '0x' + '9'.repeat(40);
      const { request, params } = createAddressRequest(newAddress);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.totalSpent).toBe(0);
      expect(json.totalTransactions).toBe(0);
      expect(Array.isArray(json.chains)).toBe(true);
    });

    it('should handle URL encoded addresses', async () => {
      const encodedAddress = encodeURIComponent(MOCK_ADDRESS);
      const { request, params } = createAddressRequest(encodedAddress);

      const response = await GET(request, params);
      
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('GET - Data Validation', () => {
    it('should have non-negative gas values', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json.totalSpent).toBeGreaterThanOrEqual(0);
      
      if (json.chains) {
        json.chains.forEach((chain: any) => {
          expect(chain.gasSpent).toBeGreaterThanOrEqual(0);
          expect(chain.transactionCount).toBeGreaterThanOrEqual(0);
          if (chain.averageGasPrice !== null) {
            expect(chain.averageGasPrice).toBeGreaterThanOrEqual(0);
          }
        });
      }
    });

    it('should have valid chain IDs', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.chains && json.chains.length > 0) {
        json.chains.forEach((chain: any) => {
          expect(typeof chain.chainId).toBe('number');
          expect(chain.chainId).toBeGreaterThan(0);
        });
      }
    });

    it('should have non-empty chain names', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.chains && json.chains.length > 0) {
        json.chains.forEach((chain: any) => {
          expect(typeof chain.chainName).toBe('string');
          expect(chain.chainName.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('GET - Performance', () => {
    it('should respond within acceptable time for cached requests', async () => {
      const { request: req1, params: params1 } = createAddressRequest(MOCK_ADDRESS);
      await GET(req1, params1);

      const start = Date.now();
      const { request: req2, params: params2 } = createAddressRequest(MOCK_ADDRESS);
      await GET(req2, params2);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should respond within acceptable time for uncached requests', async () => {
      const start = Date.now();
      const { request, params } = createAddressRequest(MOCK_ADDRESS);
      await GET(request, params);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });
  });
});

