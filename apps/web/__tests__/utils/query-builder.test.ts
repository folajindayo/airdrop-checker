/**
 * Tests for query builder utility
 */

import { buildQuery, buildPagination, buildFilters } from '@/lib/utils/query-builder';

describe('Query Builder', () => {
  describe('buildQuery', () => {
    it('should build query string from object', () => {
      const params = { address: '0x123', chainId: 1 };
      const query = buildQuery(params);

      expect(query).toContain('address=0x123');
      expect(query).toContain('chainId=1');
    });

    it('should handle empty object', () => {
      const query = buildQuery({});
      expect(query).toBe('');
    });

    it('should encode special characters', () => {
      const params = { search: 'test query' };
      const query = buildQuery(params);
      expect(query).toContain('test%20query');
    });
  });

  describe('buildPagination', () => {
    it('should build pagination object', () => {
      const pagination = buildPagination(1, 10);

      expect(pagination).toHaveProperty('page', 1);
      expect(pagination).toHaveProperty('limit', 10);
      expect(pagination).toHaveProperty('skip', 10);
    });

    it('should calculate skip correctly', () => {
      const pagination = buildPagination(0, 10);
      expect(pagination.skip).toBe(0);

      const pagination2 = buildPagination(2, 10);
      expect(pagination2.skip).toBe(20);
    });
  });

  describe('buildFilters', () => {
    it('should build filter object', () => {
      const filters = buildFilters({ status: 'confirmed', chainId: 1 });

      expect(filters).toHaveProperty('status', 'confirmed');
      expect(filters).toHaveProperty('chainId', 1);
    });

    it('should exclude undefined values', () => {
      const filters = buildFilters({ status: 'confirmed', chainId: undefined });

      expect(filters).toHaveProperty('status');
      expect(filters).not.toHaveProperty('chainId');
    });
  });
});

