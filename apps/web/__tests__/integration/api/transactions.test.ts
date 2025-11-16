/**
 * Transactions API Integration Tests
 */

describe('Transactions API', () => {
  const testAddress = '0x' + '0'.repeat(40);

  describe('GET /api/v1/transactions', () => {
    it('should fetch transactions for address', async () => {
      const response = await fetch(`/api/v1/transactions?address=${testAddress}`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveProperty('transactions');
      expect(data.data).toHaveProperty('pagination');
    });

    it('should support pagination', async () => {
      const response = await fetch(`/api/v1/transactions?address=${testAddress}&limit=10&offset=0`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.pagination.limit).toBe(10);
    });

    it('should filter by transaction type', async () => {
      const response = await fetch(`/api/v1/transactions?address=${testAddress}&type=swap`);
      expect(response.ok).toBe(true);
    });
  });

  describe('POST /api/v1/transactions/analyze', () => {
    it('should analyze transaction patterns', async () => {
      const response = await fetch('/api/v1/transactions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: testAddress, timeRange: '30d' }),
      });
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveProperty('analysis');
    });
  });
});

