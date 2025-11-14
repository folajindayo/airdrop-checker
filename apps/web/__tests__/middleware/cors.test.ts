/**
 * @fileoverview Tests for CORS middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  setCorsHeaders,
  handlePreflight,
  withCors,
  createCorsConfig,
  createApiKeyCorsConfig,
  createWebhookCorsConfig,
  validateCorsConfig,
  isAllowedOrigin,
  getCorsHeaders,
} from '@/lib/middleware/cors';

describe('CORS Middleware', () => {
  describe('setCorsHeaders', () => {
    it('should set CORS headers on response', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed-origin.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: 'https://allowed-origin.com',
      });

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://allowed-origin.com'
      );
      expect(result.headers.get('Access-Control-Allow-Methods')).toContain(
        'GET'
      );
      expect(result.headers.get('Access-Control-Allow-Headers')).toContain(
        'Content-Type'
      );
    });

    it('should handle wildcard origin in development', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://any-origin.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: '*',
        allowAll: true,
      });

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should not set origin header for disallowed origins', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://malicious-origin.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: 'https://allowed-origin.com',
      });

      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('should handle array of allowed origins', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed2.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: ['https://allowed1.com', 'https://allowed2.com'],
      });

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://allowed2.com'
      );
    });

    it('should handle function-based origin validation', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://sub.allowed.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: (origin) => origin.endsWith('.allowed.com'),
      });

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://sub.allowed.com'
      );
    });

    it('should set credentials header when configured', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed-origin.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: 'https://allowed-origin.com',
        credentials: true,
      });

      expect(result.headers.get('Access-Control-Allow-Credentials')).toBe(
        'true'
      );
    });

    it('should not set credentials with wildcard origin', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://any-origin.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: '*',
        credentials: true,
        allowAll: true,
      });

      expect(result.headers.get('Access-Control-Allow-Credentials')).toBeNull();
    });

    it('should set exposed headers', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed-origin.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: 'https://allowed-origin.com',
        exposedHeaders: ['X-Custom-Header', 'X-Response-Time'],
      });

      expect(result.headers.get('Access-Control-Expose-Headers')).toContain(
        'X-Custom-Header'
      );
    });

    it('should set max age header', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed-origin.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: 'https://allowed-origin.com',
        maxAge: 3600,
      });

      expect(result.headers.get('Access-Control-Max-Age')).toBe('3600');
    });

    it('should set Vary header for non-wildcard origins', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed-origin.com' },
      });
      const response = NextResponse.json({ data: 'test' });

      const result = setCorsHeaders(response, request, {
        origin: 'https://allowed-origin.com',
        allowAll: false,
      });

      expect(result.headers.get('Vary')).toBe('Origin');
    });
  });

  describe('handlePreflight', () => {
    it('should handle OPTIONS requests', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'OPTIONS',
        headers: { origin: 'https://allowed-origin.com' },
      });

      const response = handlePreflight(request, {
        origin: 'https://allowed-origin.com',
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://allowed-origin.com'
      );
    });

    it('should return no body for preflight requests', async () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'OPTIONS',
        headers: { origin: 'https://allowed-origin.com' },
      });

      const response = handlePreflight(request, {
        origin: 'https://allowed-origin.com',
      });

      const body = await response.text();
      expect(body).toBe('');
    });
  });

  describe('withCors', () => {
    it('should wrap handler with CORS headers', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const wrappedHandler = withCors(handler, {
        origin: 'https://allowed-origin.com',
      });

      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed-origin.com' },
      });

      const response = await wrappedHandler(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://allowed-origin.com'
      );

      const data = await response.json();
      expect(data).toEqual({ data: 'test' });
    });

    it('should handle OPTIONS requests automatically', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const wrappedHandler = withCors(handler, {
        origin: 'https://allowed-origin.com',
      });

      const request = new NextRequest('https://example.com/api/test', {
        method: 'OPTIONS',
        headers: { origin: 'https://allowed-origin.com' },
      });

      const response = await wrappedHandler(request);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://allowed-origin.com'
      );
    });

    it('should add CORS headers to error responses', async () => {
      const handler = async (req: NextRequest) => {
        throw new Error('Test error');
      };

      const wrappedHandler = withCors(handler, {
        origin: 'https://allowed-origin.com',
      });

      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed-origin.com' },
      });

      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://allowed-origin.com'
      );
    });
  });

  describe('createCorsConfig', () => {
    it('should create config for single origin', () => {
      const config = createCorsConfig('https://example.com');

      expect(config.origin).toBe('https://example.com');
      expect(config.allowAll).toBe(false);
    });

    it('should create config for multiple origins', () => {
      const config = createCorsConfig([
        'https://example1.com',
        'https://example2.com',
      ]);

      expect(config.origin).toEqual([
        'https://example1.com',
        'https://example2.com',
      ]);
    });

    it('should merge additional options', () => {
      const config = createCorsConfig('https://example.com', {
        methods: ['GET', 'POST'],
        maxAge: 7200,
      });

      expect(config.methods).toEqual(['GET', 'POST']);
      expect(config.maxAge).toBe(7200);
    });
  });

  describe('createApiKeyCorsConfig', () => {
    it('should include API key headers', () => {
      const config = createApiKeyCorsConfig();

      expect(config.allowedHeaders).toContain('X-API-Key');
      expect(config.allowedHeaders).toContain('X-API-Secret');
      expect(config.credentials).toBe(false);
    });
  });

  describe('createWebhookCorsConfig', () => {
    it('should create config for webhooks', () => {
      const config = createWebhookCorsConfig([
        'https://webhook1.com',
        'https://webhook2.com',
      ]);

      expect(config.origin).toEqual([
        'https://webhook1.com',
        'https://webhook2.com',
      ]);
      expect(config.methods).toEqual(['POST', 'OPTIONS']);
      expect(config.credentials).toBe(false);
      expect(config.allowAll).toBe(false);
    });
  });

  describe('validateCorsConfig', () => {
    it('should uppercase HTTP methods', () => {
      const config = validateCorsConfig({
        methods: ['get', 'post', 'PUT'],
      });

      expect(config.methods).toEqual(['GET', 'POST', 'PUT']);
    });

    it('should remove duplicate methods', () => {
      const config = validateCorsConfig({
        methods: ['GET', 'POST', 'GET', 'PUT', 'POST'],
      });

      expect(config.methods).toEqual(['GET', 'POST', 'PUT']);
    });

    it('should remove duplicate headers', () => {
      const config = validateCorsConfig({
        allowedHeaders: ['Content-Type', 'Authorization', 'Content-Type'],
      });

      expect(config.allowedHeaders).toEqual(['Content-Type', 'Authorization']);
    });

    it('should ensure maxAge is non-negative', () => {
      const config = validateCorsConfig({
        maxAge: -100,
      });

      expect(config.maxAge).toBe(0);
    });

    it('should disable credentials with wildcard origin', () => {
      const config = validateCorsConfig({
        origin: '*',
        credentials: true,
      });

      expect(config.credentials).toBe(false);
    });
  });

  describe('isAllowedOrigin', () => {
    it('should return true for allowed origin', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://allowed-origin.com' },
      });

      const result = isAllowedOrigin(request, {
        origin: 'https://allowed-origin.com',
      });

      expect(result).toBe(true);
    });

    it('should return false for disallowed origin', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://malicious-origin.com' },
      });

      const result = isAllowedOrigin(request, {
        origin: 'https://allowed-origin.com',
      });

      expect(result).toBe(false);
    });

    it('should return true when allowAll is enabled', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: { origin: 'https://any-origin.com' },
      });

      const result = isAllowedOrigin(request, {
        allowAll: true,
      });

      expect(result).toBe(true);
    });

    it('should return false when no origin header', () => {
      const request = new NextRequest('https://example.com/api/test');

      const result = isAllowedOrigin(request, {
        origin: 'https://allowed-origin.com',
      });

      expect(result).toBe(false);
    });
  });

  describe('getCorsHeaders', () => {
    it('should return headers as plain object', () => {
      const headers = getCorsHeaders('https://allowed-origin.com', {
        origin: 'https://allowed-origin.com',
        methods: ['GET', 'POST'],
        maxAge: 3600,
      });

      expect(headers['Access-Control-Allow-Origin']).toBe(
        'https://allowed-origin.com'
      );
      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Max-Age']).toBe('3600');
    });

    it('should not include origin header for null origin', () => {
      const headers = getCorsHeaders(null, {
        origin: 'https://allowed-origin.com',
      });

      expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
    });

    it('should include credentials header when configured', () => {
      const headers = getCorsHeaders('https://allowed-origin.com', {
        origin: 'https://allowed-origin.com',
        credentials: true,
      });

      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });
  });
});

