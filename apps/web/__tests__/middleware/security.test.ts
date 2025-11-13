/**
 * Tests for security middleware
 */

import {
  addSecurityHeaders,
  sanitizeInput,
  sanitizeBody,
  isOriginAllowed,
  createCorsHeaders,
  withSecurity,
} from '@/lib/middleware/security.middleware';
import { NextRequest, NextResponse } from 'next/server';

describe('Security Middleware', () => {
  describe('addSecurityHeaders', () => {
    it('should add security headers to response', () => {
      const response = NextResponse.json({ success: true });
      const secured = addSecurityHeaders(response);

      expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(secured.headers.get('X-Frame-Options')).toBe('DENY');
      expect(secured.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('javascript:');
    });

    it('should handle empty string', () => {
      const sanitized = sanitizeInput('');
      expect(sanitized).toBe('');
    });
  });

  describe('sanitizeBody', () => {
    it('should sanitize string values', () => {
      const body = { name: '<script>alert("xss")</script>' };
      const sanitized = sanitizeBody(body);

      expect(sanitized.name).not.toContain('<');
      expect(sanitized.name).not.toContain('>');
    });

    it('should sanitize array values', () => {
      const body = { tags: ['<script>', 'test'] };
      const sanitized = sanitizeBody(body);

      expect(sanitized.tags[0]).not.toContain('<');
      expect(sanitized.tags[1]).toBe('test');
    });
  });

  describe('isOriginAllowed', () => {
    it('should allow request without origin', () => {
      const request = new NextRequest('http://localhost:3000/test');
      const allowed = isOriginAllowed(request, ['http://example.com']);

      expect(allowed).toBe(true);
    });

    it('should check origin against allowed list', () => {
      const request = new NextRequest('http://localhost:3000/test', {
        headers: { origin: 'http://example.com' },
      });
      const allowed = isOriginAllowed(request, ['http://example.com']);

      expect(allowed).toBe(true);
    });
  });

  describe('createCorsHeaders', () => {
    it('should create CORS headers', () => {
      const request = new NextRequest('http://localhost:3000/test', {
        headers: { origin: 'http://example.com' },
      });
      const headers = createCorsHeaders(request, ['http://example.com']);

      expect(headers['Access-Control-Allow-Origin']).toBe('http://example.com');
      expect(headers['Access-Control-Allow-Methods']).toBeDefined();
    });
  });

  describe('withSecurity', () => {
    it('should add security headers to response', async () => {
      const handler = async () => NextResponse.json({ success: true });
      const secured = withSecurity(handler);

      const request = new NextRequest('http://localhost:3000/test');
      const response = await secured(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});

