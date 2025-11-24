/**
 * @fileoverview Response compression middleware for API routes
 * @module lib/middleware/compression
 */

import { NextResponse } from 'next/server';
import { gzipSync, brotliCompressSync, deflateSync } from 'zlib';
import { logger } from '@/lib/monitoring/logger';

/**
 * Compression options
 */
export interface CompressionOptions {
  /**
   * Minimum response size in bytes to compress (default: 1024)
   */
  threshold?: number;

  /**
   * Compression level (0-9, default: 6)
   */
  level?: number;

  /**
   * Supported compression algorithms (default: ['br', 'gzip', 'deflate'])
   */
  algorithms?: Array<'br' | 'gzip' | 'deflate'>;

  /**
   * Content types to compress (default: all)
   */
  contentTypes?: string[];

  /**
   * Enable compression logging
   */
  log?: boolean;
}

/**
 * Default compression options
 */
const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  threshold: 1024, // 1KB
  level: 6,
  algorithms: ['br', 'gzip', 'deflate'],
  contentTypes: [
    'text/html',
    'text/css',
    'text/javascript',
    'text/plain',
    'text/xml',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/x-javascript',
    'application/rss+xml',
    'application/atom+xml',
    'image/svg+xml',
  ],
  log: false,
};

/**
 * Parse Accept-Encoding header
 */
function parseAcceptEncoding(acceptEncoding: string | null): string[] {
  if (!acceptEncoding) {
    return [];
  }

  return acceptEncoding
    .split(',')
    .map((enc) => enc.trim().toLowerCase())
    .filter((enc) => enc.length > 0);
}

/**
 * Select best compression algorithm based on client support
 */
function selectCompression(
  acceptedEncodings: string[],
  supportedAlgorithms: Array<'br' | 'gzip' | 'deflate'>
): 'br' | 'gzip' | 'deflate' | null {
  for (const algorithm of supportedAlgorithms) {
    if (acceptedEncodings.includes(algorithm)) {
      return algorithm;
    }
  }

  return null;
}

/**
 * Check if content type should be compressed
 */
function shouldCompress(
  contentType: string | null,
  allowedContentTypes: string[]
): boolean {
  if (!contentType) {
    return false;
  }

  const baseContentType = contentType.split(';')[0].trim().toLowerCase();

  return allowedContentTypes.some((allowed) =>
    baseContentType.includes(allowed.toLowerCase())
  );
}

/**
 * Compress data using specified algorithm
 */
function compressData(
  data: Buffer,
  algorithm: 'br' | 'gzip' | 'deflate',
  level: number
): Buffer {
  switch (algorithm) {
    case 'br':
      return brotliCompressSync(data, {
        params: {
          [0]: level, // BROTLI_PARAM_QUALITY
        },
      });
    case 'gzip':
      return gzipSync(data, { level });
    case 'deflate':
      return deflateSync(data, { level });
    default:
      return data;
  }
}

/**
 * Compress response middleware
 */
export function withCompression(
  handler: (...args: any[]) => Promise<NextResponse>,
  options: CompressionOptions = {}
): (...args: any[]) => Promise<NextResponse> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async (...args: any[]): Promise<NextResponse> => {
    try {
      // Call the original handler
      const response = await handler(...args);

      // Extract request from args (assuming first arg is Request)
      const request = args[0];
      const acceptEncoding = request?.headers?.get?.('accept-encoding');

      // Parse accepted encodings
      const acceptedEncodings = parseAcceptEncoding(acceptEncoding);

      // Select compression algorithm
      const algorithm = selectCompression(acceptedEncodings, opts.algorithms);

      if (!algorithm) {
        return response;
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!shouldCompress(contentType, opts.contentTypes)) {
        return response;
      }

      // Get response body
      const body = await response.text();

      // Check threshold
      const bodySize = Buffer.byteLength(body, 'utf-8');
      if (bodySize < opts.threshold) {
        return response;
      }

      // Compress the body
      const startTime = Date.now();
      const bodyBuffer = Buffer.from(body, 'utf-8');
      const compressed = compressData(bodyBuffer, algorithm, opts.level);
      const compressionTime = Date.now() - startTime;

      // Calculate compression ratio
      const compressionRatio = ((1 - compressed.length / bodySize) * 100).toFixed(2);

      if (opts.log) {
        logger.debug('Response compressed', {
          algorithm,
          originalSize: bodySize,
          compressedSize: compressed.length,
          compressionRatio: `${compressionRatio}%`,
          compressionTime: `${compressionTime}ms`,
        });
      }

      // Create new response with compressed body
      const compressedResponse = new NextResponse(compressed, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'Content-Encoding': algorithm,
          'Content-Length': String(compressed.length),
          Vary: 'Accept-Encoding',
        },
      });

      return compressedResponse;
    } catch (error) {
      logger.error('Compression failed', { error });
      // Return original response on error
      return await handler(...args);
    }
  };
}

/**
 * Compress JSON response
 */
export async function compressJSON(
  data: any,
  acceptEncoding: string | null,
  options: CompressionOptions = {}
): Promise<{
  body: Buffer | string;
  encoding?: 'br' | 'gzip' | 'deflate';
  originalSize: number;
  compressedSize: number;
}> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Serialize JSON
  const json = JSON.stringify(data);
  const originalSize = Buffer.byteLength(json, 'utf-8');

  // Check threshold
  if (originalSize < opts.threshold) {
    return {
      body: json,
      originalSize,
      compressedSize: originalSize,
    };
  }

  // Parse accepted encodings
  const acceptedEncodings = parseAcceptEncoding(acceptEncoding);

  // Select compression algorithm
  const algorithm = selectCompression(acceptedEncodings, opts.algorithms);

  if (!algorithm) {
    return {
      body: json,
      originalSize,
      compressedSize: originalSize,
    };
  }

  // Compress
  const jsonBuffer = Buffer.from(json, 'utf-8');
  const compressed = compressData(jsonBuffer, algorithm, opts.level);

  return {
    body: compressed,
    encoding: algorithm,
    originalSize,
    compressedSize: compressed.length,
  };
}

/**
 * Create compressed response from data
 */
export async function createCompressedResponse(
  data: any,
  acceptEncoding: string | null,
  options: CompressionOptions = {}
): Promise<NextResponse> {
  const compressed = await compressJSON(data, acceptEncoding, options);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Content-Length': String(compressed.compressedSize),
    Vary: 'Accept-Encoding',
  };

  if (compressed.encoding) {
    headers['Content-Encoding'] = compressed.encoding;
  }

  if (options.log) {
    const compressionRatio = (
      (1 - compressed.compressedSize / compressed.originalSize) *
      100
    ).toFixed(2);

    logger.debug('Response compressed', {
      algorithm: compressed.encoding || 'none',
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      compressionRatio: `${compressionRatio}%`,
    });
  }

  return new NextResponse(compressed.body, { headers });
}

/**
 * Check if request supports compression
 */
export function supportsCompression(
  acceptEncoding: string | null,
  algorithm?: 'br' | 'gzip' | 'deflate'
): boolean {
  const accepted = parseAcceptEncoding(acceptEncoding);

  if (algorithm) {
    return accepted.includes(algorithm);
  }

  return accepted.length > 0;
}

/**
 * Get optimal compression level based on content size
 */
export function getOptimalCompressionLevel(sizeInBytes: number): number {
  if (sizeInBytes < 10 * 1024) {
    // < 10KB: low compression for speed
    return 3;
  } else if (sizeInBytes < 100 * 1024) {
    // 10KB - 100KB: medium compression
    return 6;
  } else {
    // > 100KB: high compression for size
    return 9;
  }
}

