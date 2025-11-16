/**
 * Portfolio API Integration Tests
 */

describe('Portfolio API', () => {
  const testAddress = '0x' + '0'.repeat(40);

  describe('GET /api/v1/portfolio/:address', () => {
    it('should fetch portfolio for valid address', async () => {
      const response = await fetch(`/api/v1/portfolio/${testAddress}`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.data).toHaveProperty('address');
    });

    it('should return 400 for invalid address', async () => {
      const response = await fetch('/api/v1/portfolio/invalid');
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/portfolio/compare', () => {
    it('should compare multiple portfolios', async () => {
      const addresses = [testAddress, '0x' + '1'.repeat(40)];
      const response = await fetch('/api/v1/portfolio/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
      });
      expect(response.ok).toBe(true);
    });

    it('should require at least 2 addresses', async () => {
      const response = await fetch('/api/v1/portfolio/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: [testAddress] }),
      });
      expect(response.status).toBe(400);
    });
  });
});

