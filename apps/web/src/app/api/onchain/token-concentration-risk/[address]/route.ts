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
    
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `token-concentration-risk:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const risk = {
      address: address.toLowerCase(),
      concentrationScore: 0,
      topHolderPercentage: 0,
      riskLevel: 'low',
      giniCoefficient: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, risk, 300000);
    return NextResponse.json(risk);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate concentration risk' },
      { status: 500 }
    );
  }
}
