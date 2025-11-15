import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const amount = searchParams.get('amount');
    
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `token-price-impact:${address.toLowerCase()}:${amount || 'default'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const impact = {
      address: address.toLowerCase(),
      amount: amount || '0',
      priceImpact: 0,
      slippage: 0,
      estimatedOutput: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, impact, 60000);
    return NextResponse.json(impact);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate price impact' },
      { status: 500 }
    );
  }
}

