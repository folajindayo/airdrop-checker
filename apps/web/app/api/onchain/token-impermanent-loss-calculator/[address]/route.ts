import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-impermanent-loss-calculator/[address]
 * Calculate impermanent loss for liquidity positions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const priceChange = searchParams.get('priceChange');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const change = priceChange ? parseFloat(priceChange) : 0.5;
    const cacheKey = `onchain-il-calculator:${normalizedAddress}:${change}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const calculation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      priceChange: change,
      impermanentLoss: 0,
      hodlValue: 0,
      lpValue: 0,
      timestamp: Date.now(),
    };

    try {
      // Calculate IL using formula: IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
      const priceRatio = 1 + change;
      calculation.impermanentLoss = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;
      calculation.hodlValue = 1000;
      calculation.lpValue = calculation.hodlValue * (1 + calculation.impermanentLoss / 100);
    } catch (error) {
      console.error('Error calculating IL:', error);
    }

    cache.set(cacheKey, calculation, 10 * 60 * 1000);

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Impermanent loss calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate impermanent loss',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

