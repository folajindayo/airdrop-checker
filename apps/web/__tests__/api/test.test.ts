/**
 * Tests for /api/test route
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/test/route';
import { isValidAddress } from '@airdrop-finder/shared';

describe('/api/test', () => {
  describe('GET', () => {
    it('should return available tests when no test parameter is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.availableTests).toBeDefined();
      expect(Array.isArray(data.availableTests)).toBe(true);
      expect(data.availableTests).toContain('connectivity');
      expect(data.availableTests).toContain('validation');
      expect(data.availableTests).toContain('performance');
    });

    it('should run connectivity test', async () => {
      const request = new NextRequest('http://localhost:3000/api/test?test=connectivity');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.test).toBe('connectivity');
      expect(data.status).toBe('passed');
      expect(data.timestamp).toBeDefined();
    });

    it('should run validation test', async () => {
      const request = new NextRequest('http://localhost:3000/api/test?test=validation');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.test).toBe('validation');
      expect(data.status).toBe('passed');
      expect(data.isValidAddress).toBe(true);
      expect(data.timestamp).toBeDefined();
    });

    it('should run performance test', async () => {
      const request = new NextRequest('http://localhost:3000/api/test?test=performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.test).toBe('performance');
      expect(data.status).toBe('passed');
      expect(data.responseTime).toBeDefined();
      expect(typeof data.responseTime).toBe('number');
      expect(data.responseTime).toBeGreaterThanOrEqual(0);
      expect(data.timestamp).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Mock a scenario that might cause an error
      const request = new NextRequest('http://localhost:3000/api/test?test=invalid');
      const response = await GET(request);
      const data = await response.json();

      // Should return available tests for invalid test type
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.availableTests).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should run basic test suite with default address', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toBeDefined();
      expect(data.results.total).toBeGreaterThan(0);
      expect(data.results.passed).toBeGreaterThan(0);
      expect(data.results.failed).toBe(0);
      expect(Array.isArray(data.results.tests)).toBe(true);
      expect(data.timestamp).toBeDefined();
    });

    it('should run test suite with custom address', async () => {
      const customAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ address: customAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toBeDefined();
      expect(data.results.tests).toBeDefined();
      expect(data.results.tests.length).toBeGreaterThan(0);
      
      // Check that address validation test exists
      const addressTest = data.results.tests.find((t: any) => t.name === 'Address Validation');
      expect(addressTest).toBeDefined();
      expect(addressTest.status).toBe('passed');
    });

    it('should run full test suite', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ testSuite: 'full' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toBeDefined();
      expect(data.results.total).toBeGreaterThanOrEqual(3);
      expect(data.results.passed).toBeGreaterThanOrEqual(3);
      
      // Check for specific tests in full suite
      const testNames = data.results.tests.map((t: any) => t.name);
      expect(testNames).toContain('Address Validation');
      expect(testNames).toContain('API Endpoint Availability');
      expect(testNames).toContain('Database Connectivity');
    });

    it('should validate address correctly', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const addressTest = data.results.tests.find((t: any) => t.name === 'Address Validation');
      expect(addressTest.status).toBe('passed');
      expect(isValidAddress(validAddress)).toBe(true);
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      // This should throw an error, but the route should handle it
      await expect(POST(request)).resolves.toBeDefined();
    });
  });
});

