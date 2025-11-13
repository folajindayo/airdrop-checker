/**
 * Tests for /api/validate route
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/validate/route';
import { isValidAddress } from '@airdrop-finder/shared';

describe('/api/validate', () => {
  describe('POST', () => {
    it('should validate Ethereum address', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'address',
          value: validAddress,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(true);
      expect(data.validation.sanitized).toBe(validAddress.toLowerCase());
      expect(data.validation.errors).toHaveLength(0);
    });

    it('should reject invalid Ethereum address', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'address',
          value: 'invalid-address',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(false);
      expect(data.validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate email address', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'email',
          value: 'test@example.com',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(true);
      expect(data.validation.sanitized).toBe('test@example.com');
    });

    it('should reject invalid email address', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'email',
          value: 'invalid-email',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(false);
    });

    it('should validate URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'url',
          value: 'https://example.com',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(true);
    });

    it('should reject invalid URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'url',
          value: 'not-a-url',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(false);
    });

    it('should validate IP address', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'ip',
          value: '192.168.1.1',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(true);
    });

    it('should validate number', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'number',
          value: '123.45',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(true);
      expect(data.validation.sanitized).toBe(123.45);
    });

    it('should validate and sanitize string', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'string',
          value: '  Test String  ',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.valid).toBe(true);
      expect(data.validation.sanitized).toBe('Test String');
    });

    it('should sanitize dangerous script tags from string', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'string',
          value: 'Test<script>alert("xss")</script>String',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.sanitized).not.toContain('<script>');
    });

    it('should return error when type is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          value: 'test',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('required');
    });

    it('should return error when value is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'address',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return error for unknown validation type', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'unknown',
          value: 'test',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Unknown validation type');
    });
  });
});

