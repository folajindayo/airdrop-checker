/**
 * @fileoverview Tests for request logging middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withRequestLogger,
  createRequestLogger,
  getSafeHeaders,
  formatLogEntry,
  getRequestSize,
  isBot,
  type RequestLogEntry,
} from '@/lib/middleware/request-logger';
import { logger } from '@/lib/monitoring/logger';

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Request Logger Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRequestLogger', () => {
    it('should log incoming request', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest('https://example.com/api/test');

      await loggedHandler(request);

      expect(logger.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'GET',
          path: '/api/test',
        })
      );
    });

    it('should log response with status and timing', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest('https://example.com/api/test');

      await loggedHandler(request);

      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request completed'),
        expect.objectContaining({
          status: 200,
          responseTime: expect.any(String),
        })
      );
    });

    it('should add request ID to headers', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest('https://example.com/api/test');

      const response = await loggedHandler(request);

      expect(response.headers.get('X-Request-ID')).toBeTruthy();
      expect(response.headers.get('X-Response-Time')).toMatch(/\d+ms/);
    });

    it('should handle errors gracefully', async () => {
      const handler = async (req: NextRequest) => {
        throw new Error('Test error');
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest('https://example.com/api/test');

      await expect(loggedHandler(request)).rejects.toThrow('Test error');

      expect(logger.error).toHaveBeenCalled();
    });

    it('should skip logging for configured paths', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler, {
        skipPaths: ['/api/health'],
      });

      const request = new NextRequest('https://example.com/api/health');

      await loggedHandler(request);

      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should skip logging for configured methods', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler, {
        skipMethods: ['OPTIONS'],
      });

      const request = new NextRequest('https://example.com/api/test', {
        method: 'OPTIONS',
      });

      await loggedHandler(request);

      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should extract client IP from headers', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      await loggedHandler(request);

      expect(logger.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          ip: '192.168.1.1',
        })
      );
    });

    it('should log query parameters', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest(
        'https://example.com/api/test?foo=bar&baz=qux'
      );

      await loggedHandler(request);

      // Query params are logged in the entry
      expect(logger.info).toHaveBeenCalled();
    });

    it('should use custom request ID generator', async () => {
      const customId = 'custom-id-123';

      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler, {
        generateRequestId: () => customId,
      });

      const request = new NextRequest('https://example.com/api/test');

      const response = await loggedHandler(request);

      expect(response.headers.get('X-Request-ID')).toBe(customId);
    });

    it('should use custom log level function', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' }, { status: 404 });
      };

      const loggedHandler = withRequestLogger(handler, {
        getLogLevel: (status) => {
          if (status === 404) return 'error';
          return 'info';
        },
      });

      const request = new NextRequest('https://example.com/api/test');

      await loggedHandler(request);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createRequestLogger', () => {
    it('should create logger with custom options', async () => {
      const customLogger = createRequestLogger({
        skipPaths: ['/api/custom'],
      });

      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = customLogger(handler);
      const request = new NextRequest('https://example.com/api/custom');

      await loggedHandler(request);

      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('getSafeHeaders', () => {
    it('should redact sensitive headers', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          authorization: 'Bearer token123',
          'x-api-key': 'secret-key',
          'content-type': 'application/json',
          cookie: 'session=abc123',
        },
      });

      const safeHeaders = getSafeHeaders(request);

      expect(safeHeaders.authorization).toBe('[REDACTED]');
      expect(safeHeaders['x-api-key']).toBe('[REDACTED]');
      expect(safeHeaders.cookie).toBe('[REDACTED]');
      expect(safeHeaders['content-type']).toBe('application/json');
    });

    it('should handle headers without sensitive data', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Mozilla/5.0',
        },
      });

      const safeHeaders = getSafeHeaders(request);

      expect(safeHeaders['content-type']).toBe('application/json');
      expect(safeHeaders['user-agent']).toBe('Mozilla/5.0');
    });
  });

  describe('formatLogEntry', () => {
    it('should format log entry as string', () => {
      const entry: RequestLogEntry = {
        requestId: 'req-123',
        method: 'GET',
        url: 'https://example.com/api/test',
        path: '/api/test',
        query: {},
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        referer: null,
        timestamp: Date.now(),
        status: 200,
        responseTime: 150,
      };

      const formatted = formatLogEntry(entry);

      expect(formatted).toBe('GET /api/test 200 150ms 192.168.1.1');
    });

    it('should handle missing fields', () => {
      const entry: RequestLogEntry = {
        requestId: 'req-123',
        method: 'POST',
        url: 'https://example.com/api/test',
        path: '/api/test',
        query: {},
        ip: null,
        userAgent: null,
        referer: null,
        timestamp: Date.now(),
      };

      const formatted = formatLogEntry(entry);

      expect(formatted).toBe('POST /api/test - - -');
    });
  });

  describe('getRequestSize', () => {
    it('should return request size from content-length header', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'POST',
        headers: {
          'content-length': '1024',
        },
        body: 'x'.repeat(1024),
      });

      const size = getRequestSize(request);

      expect(size).toBe(1024);
    });

    it('should return null if no content-length header', () => {
      const request = new NextRequest('https://example.com/api/test');

      const size = getRequestSize(request);

      expect(size).toBeNull();
    });
  });

  describe('isBot', () => {
    it('should detect common bots', () => {
      const botUserAgents = [
        'Googlebot/2.1',
        'Mozilla/5.0 (compatible; bingbot/2.0)',
        'Mozilla/5.0 (compatible; Yahoo! Slurp)',
        'curl/7.64.1',
        'Postman Runtime/7.26.5',
      ];

      botUserAgents.forEach((userAgent) => {
        const request = new NextRequest('https://example.com/api/test', {
          headers: { 'user-agent': userAgent },
        });

        expect(isBot(request)).toBe(true);
      });
    });

    it('should not detect regular browsers as bots', () => {
      const browserUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
      ];

      browserUserAgents.forEach((userAgent) => {
        const request = new NextRequest('https://example.com/api/test', {
          headers: { 'user-agent': userAgent },
        });

        expect(isBot(request)).toBe(false);
      });
    });

    it('should handle missing user-agent', () => {
      const request = new NextRequest('https://example.com/api/test');

      expect(isBot(request)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests with no headers', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest('https://example.com/api/test');

      await loggedHandler(request);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle very long URLs', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const longUrl = `https://example.com/api/test?${'a'.repeat(1000)}`;
      const request = new NextRequest(longUrl);

      await loggedHandler(request);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle multiple query parameters with same key', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest(
        'https://example.com/api/test?tag=a&tag=b&tag=c'
      );

      await loggedHandler(request);

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should add minimal overhead', async () => {
      const handler = async (req: NextRequest) => {
        return NextResponse.json({ data: 'test' });
      };

      const loggedHandler = withRequestLogger(handler);
      const request = new NextRequest('https://example.com/api/test');

      const start = performance.now();
      await loggedHandler(request);
      const end = performance.now();

      const overhead = end - start;
      expect(overhead).toBeLessThan(100); // Should add less than 100ms overhead
    });
  });
});

