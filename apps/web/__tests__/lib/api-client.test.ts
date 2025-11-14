/**
 * Tests for API Client
 */

import { ApiClient, api, endpoints } from '@/lib/api/client';

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should make GET request', async () => {
      const mockData = { message: 'success' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const response = await client.get('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(response.data).toEqual(mockData);
    });

    it('should include query parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await client.get('/api/test', {
        params: { id: '123', active: true },
      });

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('id=123');
      expect(callUrl).toContain('active=true');
    });

    it('should handle errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const response = await client.get('/api/test');

      expect(response.error).toBe('Not found');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await client.get('/api/test');

      expect(response.error).toBe('Network error');
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      const requestBody = { name: 'Test' };
      const mockData = { id: 1, ...requestBody };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const response = await client.post('/api/test', requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
      expect(response.data).toEqual(mockData);
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with body', async () => {
      const requestBody = { name: 'Updated' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => requestBody,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const response = await client.put('/api/test/1', requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestBody),
        })
      );
      expect(response.data).toEqual(requestBody);
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request with body', async () => {
      const requestBody = { status: 'active' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => requestBody,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const response = await client.patch('/api/test/1', requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(requestBody),
        })
      );
      expect(response.data).toEqual(requestBody);
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deleted: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const response = await client.delete('/api/test/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(response.data).toEqual({ deleted: true });
    });
  });

  describe('Headers', () => {
    it('should include default headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await client.get('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should allow custom headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await client.get('/api/test', {
        headers: { 'X-Custom-Header': 'value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'value',
          }),
        })
      );
    });

    it('should merge custom headers with defaults', async () => {
      const customClient = new ApiClient({
        headers: { 'Authorization': 'Bearer token' },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await customClient.get('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
          }),
        })
      );
    });
  });

  describe('Timeout', () => {
    it('should handle timeout', async () => {
      const slowClient = new ApiClient({ timeout: 100 });

      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({
              ok: true,
              json: async () => ({}),
            }), 1000);
          })
      );

      const response = await slowClient.get('/api/test');

      expect(response.error).toBe('Request timeout');
    });
  });

  describe('Non-JSON responses', () => {
    it('should handle text responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => 'plain text response',
        headers: new Headers({ 'content-type': 'text/plain' }),
      });

      const response = await client.get('/api/test');

      expect(response.data).toBe('plain text response');
    });

    it('should handle non-JSON error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/html' }),
      });

      const response = await client.get('/api/test');

      expect(response.error).toContain('HTTP error');
    });
  });

  describe('Custom configuration', () => {
    it('should use custom baseURL', async () => {
      const customClient = new ApiClient({ baseURL: 'https://api.example.com' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await customClient.get('/test');

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('https://api.example.com/test');
    });
  });
});

describe('Default API client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide convenience get method', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const response = await api.get('/api/test');

    expect(response.data).toEqual({ data: 'test' });
  });

  it('should provide convenience post method', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ created: true }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const response = await api.post('/api/test', { name: 'Test' });

    expect(response.data).toEqual({ created: true });
  });

  it('should provide convenience put method', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ updated: true }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const response = await api.put('/api/test/1', { name: 'Updated' });

    expect(response.data).toEqual({ updated: true });
  });

  it('should provide convenience patch method', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patched: true }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const response = await api.patch('/api/test/1', { status: 'active' });

    expect(response.data).toEqual({ patched: true });
  });

  it('should provide convenience delete method', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deleted: true }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const response = await api.delete('/api/test/1');

    expect(response.data).toEqual({ deleted: true });
  });
});

describe('API endpoints', () => {
  it('should provide airdrop check endpoint', () => {
    expect(endpoints.airdropCheck('0x123')).toBe('/api/airdrop-check/0x123');
  });

  it('should provide airdrops endpoint', () => {
    expect(endpoints.airdrops).toBe('/api/airdrops');
  });

  it('should provide portfolio endpoint', () => {
    expect(endpoints.portfolio('0x456')).toBe('/api/portfolio/0x456');
  });

  it('should provide trending endpoint', () => {
    expect(endpoints.trending).toBe('/api/trending');
  });

  it('should provide gas tracker endpoint', () => {
    expect(endpoints.gasTracker('0x789')).toBe('/api/gas-tracker/0x789');
  });

  it('should provide health endpoint', () => {
    expect(endpoints.health).toBe('/api/health');
  });

  it('should provide rate limit endpoint', () => {
    expect(endpoints.rateLimit).toBe('/api/rate-limit');
  });
});

