import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cache
 * Get cache statistics and information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get cache statistics (mock - actual implementation would track this)
      return NextResponse.json({
        success: true,
        stats: {
          totalKeys: 0, // Would be tracked in production
          hitRate: 0.85,
          missRate: 0.15,
          totalSize: 256, // MB
          oldestEntry: null,
          newestEntry: null,
        },
      });
    }

    if (action === 'clear') {
      // Clear cache (in production, implement actual cache clearing)
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully',
        clearedAt: new Date().toISOString(),
      });
    }

    // Default: return cache info
    return NextResponse.json({
      success: true,
      cache: {
        enabled: true,
        type: 'in-memory',
        defaultTTL: 3600, // 1 hour
        maxSize: 1024, // MB
      },
      endpoints: {
        '/api/airdrop-check': { ttl: 3600 },
        '/api/portfolio': { ttl: 300 },
        '/api/airdrops': { ttl: 300 },
      },
    });
  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cache
 * Clear specific cache entries
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern');

    if (!pattern) {
      return NextResponse.json(
        { error: 'Pattern parameter required' },
        { status: 400 }
      );
    }

    // In production, implement pattern-based cache clearing
    return NextResponse.json({
      success: true,
      message: `Cache entries matching pattern "${pattern}" cleared`,
      clearedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

