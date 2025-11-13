import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history/analyze
 * Analyze historical airdrop data and trends
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const timeframe = searchParams.get('timeframe') || '30d';
    const metric = searchParams.get('metric') || 'all';

    if (address && !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Mock historical analysis (in production, analyze real data)
    const analysis = {
      timeframe,
      address: address?.toLowerCase() || null,
      trends: {
        airdropFrequency: {
          current: 12,
          previous: 8,
          change: 50,
          trend: 'increasing',
        },
        averageValue: {
          current: 1200,
          previous: 800,
          change: 50,
          trend: 'increasing',
        },
        claimRate: {
          current: 65,
          previous: 55,
          change: 18.2,
          trend: 'increasing',
        },
      },
      patterns: {
        mostActiveDay: 'Tuesday',
        mostActiveHour: 14,
        preferredChains: ['ethereum', 'base', 'arbitrum'],
        topProtocols: ['Uniswap', 'Aave', 'Compound'],
      },
      predictions: {
        nextAirdropLikely: '2024-02-15',
        estimatedValue: 1500,
        confidence: 75,
      },
      statistics: {
        totalAirdrops: 150,
        totalValue: 180000,
        averageValue: 1200,
        medianValue: 800,
        highestValue: 5000,
        lowestValue: 50,
      },
    };

    // Filter by metric if specified
    if (metric !== 'all') {
      const filtered: Record<string, any> = {
        timeframe,
        address: analysis.address,
      };

      switch (metric) {
        case 'trends':
          filtered.trends = analysis.trends;
          break;
        case 'patterns':
          filtered.patterns = analysis.patterns;
          break;
        case 'predictions':
          filtered.predictions = analysis.predictions;
          break;
        case 'statistics':
          filtered.statistics = analysis.statistics;
          break;
        default:
          return NextResponse.json(
            { error: `Unknown metric: ${metric}` },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        analysis: filtered,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('History analyze API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



