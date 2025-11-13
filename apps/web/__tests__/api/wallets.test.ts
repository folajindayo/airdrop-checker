/**
 * Tests for /api/wallets route
 */

import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/wallets/route';
import { isValidAddress } from '@airdrop-finder/shared';

describe('/api/wallets', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const userId = 'test-user';

  describe('GET', () => {
    it('should return empty wallets list for new user', async () => {
      const request = new NextRequest(`http://localhost:3000/api/wallets?userId=${userId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.wallets).toBeDefined();
      expect(Array.isArray(data.wallets)).toBe(true);
      expect(data.count).toBe(0);
    });

    it('should return wallets for user', async () => {
      // First add a wallet
      const addRequest = new NextRequest('http://localhost:3000/api/wallets', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress, userId }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(addRequest);

      const request = new NextRequest(`http://localhost:3000/api/wallets?userId=${userId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.wallets.length).toBeGreaterThan(0);
      expect(data.count).toBeGreaterThan(0);
    });
  });

  describe('POST', () => {
    it('should add wallet successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/wallets', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          label: 'My Wallet',
          userId,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.wallet).toBeDefined();
      expect(data.wallet.address).toBe(validAddress.toLowerCase());
      expect(data.wallet.label).toBe('My Wallet');
      expect(data.wallet.id).toBeDefined();
      expect(data.wallet.createdAt).toBeDefined();
    });

    it('should return error for invalid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/wallets', {
        method: 'POST',
        body: JSON.stringify({
          address: 'invalid-address',
          userId,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Valid address required');
    });

    it('should prevent duplicate wallets', async () => {
      // Add wallet first time
      const request1 = new NextRequest('http://localhost:3000/api/wallets', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress, userId }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request1);

      // Try to add same wallet again
      const request2 = new NextRequest('http://localhost:3000/api/wallets', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress, userId }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request2);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('already exists');
    });

    it('should enforce wallet limit', async () => {
      // Add 10 wallets
      for (let i = 0; i < 10; i++) {
        const address = `0x${'0'.repeat(38)}${i.toString().padStart(2, '0')}`;
        const request = new NextRequest('http://localhost:3000/api/wallets', {
          method: 'POST',
          body: JSON.stringify({ address, userId: 'limit-test' }),
          headers: { 'Content-Type': 'application/json' },
        });
        await POST(request);
      }

      // Try to add 11th wallet
      const request = new NextRequest('http://localhost:3000/api/wallets', {
        method: 'POST',
        body: JSON.stringify({
          address: '0x1111111111111111111111111111111111111111',
          userId: 'limit-test',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Maximum 10 wallets');
    });
  });

  describe('DELETE', () => {
    it('should delete wallet successfully', async () => {
      // First add a wallet
      const addRequest = new NextRequest('http://localhost:3000/api/wallets', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress, userId }),
        headers: { 'Content-Type': 'application/json' },
      });
      const addResponse = await POST(addRequest);
      const addData = await addResponse.json();
      const walletId = addData.wallet.id;

      const request = new NextRequest(`http://localhost:3000/api/wallets?id=${walletId}&userId=${userId}`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('removed');
    });

    it('should return error when wallet ID is missing', async () => {
      const request = new NextRequest(`http://localhost:3000/api/wallets?userId=${userId}`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return error when wallet not found', async () => {
      const request = new NextRequest(`http://localhost:3000/api/wallets?id=non-existent&userId=${userId}`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });
});

