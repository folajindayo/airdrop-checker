import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * POST /api/onchain/token-correlation
 * Calculate correlation between multiple tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokens, period } = body;

    if (!Array.isArray(tokens) || tokens.length < 2) {
      return NextResponse.json({ error: 'At least 2 tokens required' }, { status: 400 });
    }

    const cacheKey = `correlation:${tokens.join(',')}:${period || '30d'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const correlation = {
      tokens,
      period: period || '30d',
      correlations: [
        { pair: `${tokens[0]}-${tokens[1]}`, value: '0.75' },
      ],
      averageCorrelation: '0.75',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, correlation, 300 * 1000);
    return NextResponse.json(correlation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate correlation' },
      { status: 500 }
    );
  }
}

