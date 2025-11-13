/**
 * Tests for /api/wallet-validator route
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/wallet-validator/route';
import { isValidAddress } from '@airdrop-finder/shared';

describe('/api/wallet-validator', () => {
  describe('POST', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

    it('should validate wallet address successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/wallet-validator', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.isValid).toBe(true);
      expect(data.checks).toBeDefined();
      expect(data.warnings).toBeDefined();
      expect(data.recommendations).toBeDefined();
      expect(data.healthScore).toBeDefined();
    });

    it('should return error when address is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/wallet-validator', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return error for invalid address format', async () => {
      const request = new NextRequest('http://localhost:3000/api/wallet-validator', {
        method: 'POST',
        body: JSON.stringify({ address: 'invalid-address' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid address format');
    });

    it('should include all validation checks', async () => {
      const request = new NextRequest('http://localhost:3000/api/wallet-validator', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.checks).toHaveProperty('format');
      expect(data.checks).toHaveProperty('checksum');
      expect(data.checks).toHaveProperty('isContract');
      expect(data.checks).toHaveProperty('hasActivity');
      expect(data.checks).toHaveProperty('balance');
      expect(data.checks.balance).toHaveProperty('hasBalance');
      expect(data.checks.balance).toHaveProperty('totalBalance');
    });

    it('should calculate health score', async () => {
      const request = new NextRequest('http://localhost:3000/api/wallet-validator', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.healthScore).toBeDefined();
      expect(typeof data.healthScore).toBe('number');
      expect(data.healthScore).toBeGreaterThanOrEqual(0);
      expect(data.healthScore).toBeLessThanOrEqual(100);
    });

    it('should include timestamp', async () => {
      const request = new NextRequest('http://localhost:3000/api/wallet-validator', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe('number');
    });
  });
});

