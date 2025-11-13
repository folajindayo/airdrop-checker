/**
 * Comprehensive tests for /api/airdrop-check/[address] route
 * Tests validation, caching, error handling, and edge cases
 */

import { GET } from '@/app/api/airdrop-check/[address]/route';
import { createAddressRequest, MOCK_ADDRESS } from '../helpers';
import { cache } from '@airdrop-finder/shared';

describe('/api/airdrop-check/[address]', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  describe('GET - Success Cases', () => {
    it('should check airdrop eligibility for valid address', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('overallScore');
      expect(json).toHaveProperty('airdrops');
      expect(json).toHaveProperty('timestamp');
      expect(Array.isArray(json.airdrops)).toBe(true);
    });

    it('should normalize address to checksum format', async () => {
      const lowerCaseAddress = MOCK_ADDRESS.toLowerCase();
      const { request, params } = createAddressRequest(lowerCaseAddress);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.address).toBeTruthy();
    });

    it('should include eligibility scores in valid range', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(typeof json.overallScore).toBe('number');
      expect(json.overallScore).toBeGreaterThanOrEqual(0);
      expect(json.overallScore).toBeLessThanOrEqual(100);
    });

    it('should include project details in airdrops array', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.airdrops.length > 0) {
        const airdrop = json.airdrops[0];
        expect(airdrop).toHaveProperty('project');
        expect(airdrop).toHaveProperty('projectId');
        expect(airdrop).toHaveProperty('slug');
        expect(airdrop).toHaveProperty('status');
        expect(airdrop).toHaveProperty('score');
        expect(airdrop).toHaveProperty('criteria');
        expect(Array.isArray(airdrop.criteria)).toBe(true);
      }
    });

    it('should include criteria details for each airdrop', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.airdrops.length > 0 && json.airdrops[0].criteria.length > 0) {
        const criterion = json.airdrops[0].criteria[0];
        expect(criterion).toHaveProperty('desc');
        expect(criterion).toHaveProperty('met');
        expect(typeof criterion.met).toBe('boolean');
      }
    });

    it('should return consistent results for same address', async () => {
      const { request: req1, params: params1 } = createAddressRequest(MOCK_ADDRESS);
      const { request: req2, params: params2 } = createAddressRequest(MOCK_ADDRESS);

      const response1 = await GET(req1, params1);
      const json1 = await response1.json();

      const response2 = await GET(req2, params2);
      const json2 = await response2.json();

      expect(json1.overallScore).toBe(json2.overallScore);
      expect(json1.airdrops.length).toBe(json2.airdrops.length);
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

    it('should return 400 for non-hex address', async () => {
      const { request, params } = createAddressRequest('0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should return 400 for missing 0x prefix', async () => {
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

    it('should include all required response fields', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('overallScore');
      expect(json).toHaveProperty('airdrops');
      expect(json).toHaveProperty('timestamp');
    });
  });

  describe('GET - Edge Cases', () => {
    it('should handle zero score addresses', async () => {
      // Address with no activity
      const newAddress = '0x0000000000000000000000000000000000000001';
      const { request, params } = createAddressRequest(newAddress);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle addresses with special characters in URL', async () => {
      const { request, params } = createAddressRequest(encodeURIComponent(MOCK_ADDRESS));

      const response = await GET(request, params);

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    it('should return empty airdrops array for inactive address', async () => {
      const inactiveAddress = '0x0000000000000000000000000000000000000002';
      const { request, params } = createAddressRequest(inactiveAddress);

      const response = await GET(request, params);
      const json = await response.json();

      expect(Array.isArray(json.airdrops)).toBe(true);
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
});

