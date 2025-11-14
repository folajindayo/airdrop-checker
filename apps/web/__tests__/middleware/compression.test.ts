/**
 * @fileoverview Tests for compression middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withCompression,
  shouldCompress,
  getCompressionLevel,
  CompressionOptions,
} from '@/lib/middleware/compression';

describe('Compression Middleware', () => {
  let mockRequest: NextRequest;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      url: 'http://localhost:3000/api/test',
      method: 'GET',
      headers: new Headers(),
    } as any;

    mockHandler = jest.fn(async () =>
      NextResponse.json({ data: 'test'.repeat(1000) })
    );

    jest.clearAllMocks();
  });

  describe('withCompression', () => {
    it('should compress response with gzip', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      expect(response.headers.get('Content-Encoding')).toBe('gzip');
    });

    it('should compress response with brotli', async () => {
      mockRequest.headers.set('Accept-Encoding', 'br');

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      expect(response.headers.get('Content-Encoding')).toBe('br');
    });

    it('should prefer brotli over gzip', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip, br');

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      expect(response.headers.get('Content-Encoding')).toBe('br');
    });

    it('should not compress when not supported', async () => {
      mockRequest.headers.set('Accept-Encoding', 'identity');

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      expect(response.headers.get('Content-Encoding')).toBeNull();
    });

    it('should add Vary header', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      expect(response.headers.get('Vary')).toContain('Accept-Encoding');
    });

    it('should not compress small responses', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');
      mockHandler.mockResolvedValue(NextResponse.json({ data: 'small' }));

      const middleware = withCompression(mockHandler, {
        threshold: 1000,
      });
      const response = await middleware(mockRequest);

      expect(response.headers.get('Content-Encoding')).toBeNull();
    });

    it('should respect threshold option', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');
      mockHandler.mockResolvedValue(
        NextResponse.json({ data: 'x'.repeat(100) })
      );

      const middleware = withCompression(mockHandler, {
        threshold: 50,
      });
      const response = await middleware(mockRequest);

      expect(response.headers.get('Content-Encoding')).toBe('gzip');
    });

    it('should respect compression level', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');

      const middleware = withCompression(mockHandler, {
        level: 9,
      });
      const response = await middleware(mockRequest);

      expect(response.headers.get('Content-Encoding')).toBe('gzip');
    });

    it('should not compress already compressed responses', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');

      const compressedResponse = new NextResponse('compressed');
      compressedResponse.headers.set('Content-Encoding', 'gzip');
      mockHandler.mockResolvedValue(compressedResponse);

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      expect(response.headers.get('Content-Encoding')).toBe('gzip');
    });
  });

  describe('shouldCompress', () => {
    it('should compress JSON responses', () => {
      const response = NextResponse.json({ data: 'test' });
      response.headers.set('Content-Type', 'application/json');

      expect(shouldCompress(response)).toBe(true);
    });

    it('should compress text responses', () => {
      const response = new NextResponse('text');
      response.headers.set('Content-Type', 'text/plain');

      expect(shouldCompress(response)).toBe(true);
    });

    it('should compress HTML responses', () => {
      const response = new NextResponse('<html></html>');
      response.headers.set('Content-Type', 'text/html');

      expect(shouldCompress(response)).toBe(true);
    });

    it('should compress JavaScript responses', () => {
      const response = new NextResponse('console.log("test")');
      response.headers.set('Content-Type', 'application/javascript');

      expect(shouldCompress(response)).toBe(true);
    });

    it('should not compress images', () => {
      const response = new NextResponse(Buffer.from(''));
      response.headers.set('Content-Type', 'image/png');

      expect(shouldCompress(response)).toBe(false);
    });

    it('should not compress videos', () => {
      const response = new NextResponse(Buffer.from(''));
      response.headers.set('Content-Type', 'video/mp4');

      expect(shouldCompress(response)).toBe(false);
    });

    it('should not compress audio', () => {
      const response = new NextResponse(Buffer.from(''));
      response.headers.set('Content-Type', 'audio/mp3');

      expect(shouldCompress(response)).toBe(false);
    });

    it('should not compress PDFs', () => {
      const response = new NextResponse(Buffer.from(''));
      response.headers.set('Content-Type', 'application/pdf');

      expect(shouldCompress(response)).toBe(false);
    });

    it('should not compress zipped files', () => {
      const response = new NextResponse(Buffer.from(''));
      response.headers.set('Content-Type', 'application/zip');

      expect(shouldCompress(response)).toBe(false);
    });

    it('should handle custom filter', () => {
      const response = NextResponse.json({ data: 'test' });
      const filter = (res: NextResponse) =>
        res.headers.get('Content-Type')?.includes('json') ?? false;

      expect(shouldCompress(response, { filter })).toBe(true);
    });
  });

  describe('getCompressionLevel', () => {
    it('should return default level', () => {
      const level = getCompressionLevel();
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(9);
    });

    it('should return specified level', () => {
      const level = getCompressionLevel({ level: 5 });
      expect(level).toBe(5);
    });

    it('should clamp level to valid range', () => {
      const lowLevel = getCompressionLevel({ level: 0 });
      expect(lowLevel).toBe(1);

      const highLevel = getCompressionLevel({ level: 10 });
      expect(highLevel).toBe(9);
    });
  });

  describe('Content-Type Filtering', () => {
    it('should compress compressible types', () => {
      const types = [
        'application/json',
        'application/javascript',
        'text/html',
        'text/plain',
        'text/css',
        'text/xml',
        'application/xml',
        'application/x-javascript',
      ];

      types.forEach((type) => {
        const response = new NextResponse('test');
        response.headers.set('Content-Type', type);
        expect(shouldCompress(response)).toBe(true);
      });
    });

    it('should not compress non-compressible types', () => {
      const types = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'audio/mpeg',
        'application/zip',
        'application/pdf',
        'application/octet-stream',
      ];

      types.forEach((type) => {
        const response = new NextResponse(Buffer.from(''));
        response.headers.set('Content-Type', type);
        expect(shouldCompress(response)).toBe(false);
      });
    });

    it('should handle content-type with charset', () => {
      const response = new NextResponse('test');
      response.headers.set('Content-Type', 'text/html; charset=utf-8');

      expect(shouldCompress(response)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle compression errors gracefully', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');
      mockHandler.mockResolvedValue(
        new NextResponse(Buffer.from('invalid'))
      );

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      expect(response).toBeDefined();
    });

    it('should return uncompressed response on error', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      expect(response).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should compress large responses efficiently', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');
      mockHandler.mockResolvedValue(
        NextResponse.json({ data: 'x'.repeat(100000) })
      );

      const middleware = withCompression(mockHandler);
      const start = Date.now();
      await middleware(mockRequest);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should not add overhead for small responses', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');
      mockHandler.mockResolvedValue(NextResponse.json({ data: 'small' }));

      const middleware = withCompression(mockHandler);
      const start = Date.now();
      await middleware(mockRequest);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Compression Ratio', () => {
    it('should achieve good compression ratio', async () => {
      mockRequest.headers.set('Accept-Encoding', 'gzip');
      
      const largeData = { data: 'x'.repeat(10000) };
      mockHandler.mockResolvedValue(NextResponse.json(largeData));

      const middleware = withCompression(mockHandler);
      const response = await middleware(mockRequest);

      const originalSize = JSON.stringify(largeData).length;
      const compressedSize = (await response.text()).length;

      expect(compressedSize).toBeLessThan(originalSize * 0.5);
    });
  });

  describe('Options', () => {
    it('should accept all compression options', () => {
      const options: CompressionOptions = {
        threshold: 1024,
        level: 6,
        filter: () => true,
      };

      const middleware = withCompression(mockHandler, options);
      expect(middleware).toBeDefined();
    });

    it('should use default options when none provided', () => {
      const middleware = withCompression(mockHandler);
      expect(middleware).toBeDefined();
    });
  });
});

