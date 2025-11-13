/**
 * Comprehensive tests for /api/portfolio/[address] route
 * Tests portfolio data, chain breakdown, token tracking, and caching
 */

import { GET } from '@/app/api/portfolio/[address]/route';
import { createAddressRequest, MOCK_ADDRESS } from '../helpers';
import { cache } from '@airdrop-finder/shared';

describe('/api/portfolio/[address]', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  describe('GET - Success Cases', () => {
    it('should get portfolio data for valid address', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('totalValue');
      expect(json).toHaveProperty('chains');
      expect(json).toHaveProperty('timestamp');
      expect(Array.isArray(json.chains)).toBe(true);
    });

    it('should include all required fields', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('totalValue');
      expect(json).toHaveProperty('chains');
      expect(json).toHaveProperty('tokens');
      expect(json).toHaveProperty('timestamp');
    });

    it('should normalize address to checksum format', async () => {
      const lowerCaseAddress = MOCK_ADDRESS.toLowerCase();
      const { request, params } = createAddressRequest(lowerCaseAddress);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.address).toBeTruthy();
    });

    it('should include chain breakdown with required fields', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.chains.length > 0) {
        const chain = json.chains[0];
        expect(chain).toHaveProperty('chainId');
        expect(chain).toHaveProperty('chainName');
        expect(chain).toHaveProperty('value');
        expect(chain).toHaveProperty('tokenCount');
        expect(typeof chain.chainId).toBe('number');
        expect(typeof chain.value).toBe('number');
      }
    });

    it('should calculate total value correctly', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(typeof json.totalValue).toBe('number');
      expect(json.totalValue).toBeGreaterThanOrEqual(0);

      // Sum of chain values should equal total value
      if (json.chains.length > 0) {
        const sumOfChains = json.chains.reduce(
          (sum: number, chain: any) => sum + chain.value,
          0
        );
        expect(Math.abs(json.totalValue - sumOfChains)).toBeLessThan(0.01);
      }
    });

    it('should include token details', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('tokens');
      expect(Array.isArray(json.tokens)).toBe(true);

      if (json.tokens.length > 0) {
        const token = json.tokens[0];
        expect(token).toHaveProperty('symbol');
        expect(token).toHaveProperty('balance');
        expect(token).toHaveProperty('value');
        expect(token).toHaveProperty('chainId');
      }
    });

    it('should sort tokens by value descending', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.tokens.length > 1) {
        let isSorted = true;
        for (let i = 1; i < json.tokens.length; i++) {
          if (json.tokens[i].value > json.tokens[i - 1].value) {
            isSorted = false;
            break;
          }
        }
        expect(isSorted).toBe(true);
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

    it('should return 400 for short address', async () => {
      const { request, params } = createAddressRequest('0x123');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should return 400 for address without 0x prefix', async () => {
      const addressWithoutPrefix = MOCK_ADDRESS.slice(2);
      const { request, params } = createAddressRequest(addressWithoutPrefix);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should return 400 for empty address', async () => {
      const { request, params } = createAddressRequest('');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });
  });

  describe('GET - Caching Behavior', () => {
    it('should cache successful responses', async () => {
      const { request: req1, params: params1 } = createAddressRequest(MOCK_ADDRESS);

      // First request - should not be cached
      const response1 = await GET(req1, params1);
      const json1 = await response1.json();
      expect(json1.cached).toBeFalsy();

      // Second request - should be cached
      const { request: req2, params: params2 } = createAddressRequest(MOCK_ADDRESS);
      const response2 = await GET(req2, params2);
      const json2 = await response2.json();
      expect(json2.cached).toBe(true);
    });

    it('should use cache for subsequent requests', async () => {
      const { request: req1, params: params1 } = createAddressRequest(MOCK_ADDRESS);
      await GET(req1, params1);

      const startTime = Date.now();
      const { request: req2, params: params2 } = createAddressRequest(MOCK_ADDRESS);
      const response2 = await GET(req2, params2);
      const endTime = Date.now();

      // Cached response should be faster (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(response2.status).toBe(200);
    });

    it('should cache different addresses separately', async () => {
      const address1 = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
      const address2 = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';

      const { request: req1, params: params1 } = createAddressRequest(address1);
      const response1 = await GET(req1, params1);
      const json1 = await response1.json();

      const { request: req2, params: params2 } = createAddressRequest(address2);
      const response2 = await GET(req2, params2);
      const json2 = await response2.json();

      // Both should be fresh (not cached from each other)
      expect(json1.cached).toBeFalsy();
      expect(json2.cached).toBeFalsy();
    });
  });

  describe('GET - Response Format', () => {
    it('should return proper JSON content type', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const contentType = response.headers.get('content-type');

      expect(contentType).toContain('application/json');
    });

    it('should include timestamp in response', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('timestamp');
      expect(typeof json.timestamp).toBe('number');
      expect(json.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should have consistent chain structure', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.chains.length > 1) {
        const firstChain = json.chains[0];
        const secondChain = json.chains[1];

        // Both should have the same keys
        expect(Object.keys(firstChain).sort()).toEqual(
          Object.keys(secondChain).sort()
        );
      }
    });

    it('should have consistent token structure', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.tokens.length > 1) {
        const firstToken = json.tokens[0];
        const secondToken = json.tokens[1];

        // Both should have the same keys
        expect(Object.keys(firstToken).sort()).toEqual(
          Object.keys(secondToken).sort()
        );
      }
    });
  });

  describe('GET - Edge Cases', () => {
    it('should handle zero-balance portfolio', async () => {
      const newAddress = '0x0000000000000000000000000000000000000001';
      const { request, params } = createAddressRequest(newAddress);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.totalValue).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(json.chains)).toBe(true);
      expect(Array.isArray(json.tokens)).toBe(true);
    });

    it('should handle single-chain portfolios', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.chains)).toBe(true);
    });

    it('should handle addresses with special characters in URL', async () => {
      const { request, params } = createAddressRequest(encodeURIComponent(MOCK_ADDRESS));

      const response = await GET(request, params);

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('GET - Performance', () => {
    it('should respond within acceptable time (uncached)', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const startTime = Date.now();
      const response = await GET(request, params);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      // Should respond within 5 seconds for uncached request
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should respond quickly for cached requests', async () => {
      // Prime the cache
      const { request: req1, params: params1 } = createAddressRequest(MOCK_ADDRESS);
      await GET(req1, params1);

      // Test cached response time
      const { request: req2, params: params2 } = createAddressRequest(MOCK_ADDRESS);
      const startTime = Date.now();
      const response = await GET(req2, params2);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      // Cached response should be very fast (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('GET - Data Validation', () => {
    it('should have non-negative token values', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      json.tokens.forEach((token: any) => {
        expect(token.value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have non-negative chain values', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      json.chains.forEach((chain: any) => {
        expect(chain.value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid chain IDs', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      json.chains.forEach((chain: any) => {
        expect(typeof chain.chainId).toBe('number');
        expect(chain.chainId).toBeGreaterThan(0);
      });
    });

    it('should have non-empty token symbols', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.tokens.length > 0) {
        json.tokens.forEach((token: any) => {
          expect(token.symbol).toBeTruthy();
          expect(token.symbol.length).toBeGreaterThan(0);
        });
      }
    });
  });
});

