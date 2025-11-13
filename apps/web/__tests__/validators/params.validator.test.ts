/**
 * Tests for params validator
 */

import { validateRouteParams, validateQueryParams } from '@/lib/validators/params.validator';

describe('Params Validator', () => {
  describe('validateRouteParams', () => {
    it('should validate route params with address', () => {
      const params = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' };
      const result = validateRouteParams(params);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid address in params', () => {
      const params = { address: 'invalid' };
      const result = validateRouteParams(params);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate optional params', () => {
      const params = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', projectId: 'zora' };
      const result = validateRouteParams(params);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateQueryParams', () => {
    it('should validate query params', () => {
      const params = { status: 'confirmed', limit: '10' };
      const result = validateQueryParams(params, {
        status: { type: 'string', required: false },
        limit: { type: 'number', required: false },
      });

      expect(result.valid).toBe(true);
    });

    it('should validate required params', () => {
      const params = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' };
      const result = validateQueryParams(params, {
        address: { type: 'string', required: true },
      });

      expect(result.valid).toBe(true);
    });

    it('should reject missing required params', () => {
      const params = {};
      const result = validateQueryParams(params, {
        address: { type: 'string', required: true },
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

