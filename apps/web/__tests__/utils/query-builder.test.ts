/**
 * Tests for query builder utility
 */

import {
  buildWhereClause,
  buildOrderByClause,
  buildLimitClause,
  escapeSqlString,
  buildSearchQuery,
} from '@/lib/utils/query-builder';

describe('Query Builder', () => {
  describe('buildWhereClause', () => {
    it('should build WHERE clause from filters', () => {
      const filters = { status: 'confirmed', chainId: 1 };
      const clause = buildWhereClause(filters);

      expect(clause).toContain('WHERE');
      expect(clause).toContain('status');
      expect(clause).toContain('chainId');
    });

    it('should handle empty filters', () => {
      const clause = buildWhereClause({});
      expect(clause).toBe('');
    });

    it('should handle array values', () => {
      const filters = { chainIds: [1, 8453] };
      const clause = buildWhereClause(filters);

      expect(clause).toContain('IN');
      expect(clause).toContain('1');
      expect(clause).toContain('8453');
    });
  });

  describe('buildOrderByClause', () => {
    it('should build ORDER BY clause', () => {
      const clause = buildOrderByClause('createdAt', 'desc');

      expect(clause).toContain('ORDER BY');
      expect(clause).toContain('createdAt');
      expect(clause).toContain('DESC');
    });

    it('should default to DESC order', () => {
      const clause = buildOrderByClause('createdAt');

      expect(clause).toContain('DESC');
    });
  });

  describe('buildLimitClause', () => {
    it('should build LIMIT clause', () => {
      const clause = buildLimitClause(10);

      expect(clause).toContain('LIMIT 10');
    });

    it('should include OFFSET when provided', () => {
      const clause = buildLimitClause(10, 20);

      expect(clause).toContain('LIMIT 10');
      expect(clause).toContain('OFFSET 20');
    });
  });

  describe('escapeSqlString', () => {
    it('should escape single quotes', () => {
      const escaped = escapeSqlString("test'value");
      expect(escaped).toBe("test''value");
    });
  });

  describe('buildSearchQuery', () => {
    it('should build search query for multiple fields', () => {
      const query = buildSearchQuery(['name', 'description'], 'test');

      expect(query).toContain('name');
      expect(query).toContain('description');
      expect(query).toContain('test');
    });
  });
});

