import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-execution-tracker/[address]
 * Track proposal execution status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `execution-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const execution = {
      proposalAddress: address,
      status: 'pending',
      executionTime: null,
      executed: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, execution, 60 * 1000);
    return NextResponse.json(execution);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track execution' },
      { status: 500 }
    );
  }
}

