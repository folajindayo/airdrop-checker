import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface UsageRecord {
  address: string;
  endpoint: string;
  timestamp: string;
  responseTime: number;
  statusCode: number;
}

// In-memory storage (in production, use database)
const usageRecords: UsageRecord[] = [];

/**
 * POST /api/usage/track
 * Track API usage for analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, endpoint, responseTime, statusCode } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'endpoint is required' },
        { status: 400 }
      );
    }

    if (address && !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const record: UsageRecord = {
      address: address?.toLowerCase() || 'anonymous',
      endpoint,
      timestamp: new Date().toISOString(),
      responseTime: responseTime || 0,
      statusCode: statusCode || 200,
    };

    usageRecords.push(record);

    // Keep only last 1000 records (in production, use database)
    if (usageRecords.length > 1000) {
      usageRecords.shift();
    }

    return NextResponse.json({
      success: true,
      tracked: true,
      record,
    });
  } catch (error) {
    console.error('Usage track API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track usage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/usage/track
 * Get usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const endpoint = searchParams.get('endpoint');
    const timeframe = searchParams.get('timeframe') || '24h';

    let filteredRecords = usageRecords;

    // Filter by address
    if (address) {
      if (!isValidAddress(address)) {
        return NextResponse.json(
          { error: 'Invalid Ethereum address' },
          { status: 400 }
        );
      }
      filteredRecords = filteredRecords.filter(
        (r) => r.address === address.toLowerCase()
      );
    }

    // Filter by endpoint
    if (endpoint) {
      filteredRecords = filteredRecords.filter((r) => r.endpoint === endpoint);
    }

    // Filter by timeframe
    const timeframeMs = timeframe === '24h' ? 24 * 60 * 60 * 1000
      : timeframe === '7d' ? 7 * 24 * 60 * 60 * 1000
      : timeframe === '30d' ? 30 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    const cutoffTime = new Date(Date.now() - timeframeMs);
    filteredRecords = filteredRecords.filter(
      (r) => new Date(r.timestamp) >= cutoffTime
    );

    // Calculate statistics
    const stats = {
      totalRequests: filteredRecords.length,
      averageResponseTime: filteredRecords.length > 0
        ? filteredRecords.reduce((sum, r) => sum + r.responseTime, 0) / filteredRecords.length
        : 0,
      successRate: filteredRecords.length > 0
        ? (filteredRecords.filter((r) => r.statusCode < 400).length / filteredRecords.length) * 100
        : 0,
      endpointBreakdown: {} as Record<string, number>,
      statusCodeBreakdown: {} as Record<number, number>,
    };

    filteredRecords.forEach((r) => {
      stats.endpointBreakdown[r.endpoint] = (stats.endpointBreakdown[r.endpoint] || 0) + 1;
      stats.statusCodeBreakdown[r.statusCode] = (stats.statusCodeBreakdown[r.statusCode] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      statistics: stats,
      timeframe,
      address: address?.toLowerCase() || null,
      endpoint: endpoint || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Usage track API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get usage statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

