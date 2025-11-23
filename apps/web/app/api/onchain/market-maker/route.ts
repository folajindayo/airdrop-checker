import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { MarketMakerRequest, MarketMaker } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: MarketMakerRequest = await request.json();
    const { tokenAddress, chainId, timeRange = 7 } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Detect market maker activity (simplified)
    const hasMarketMaker = true;
    const marketMakerAddresses: Address[] = [
      '0x1111111111111111111111111111111111111111' as Address,
      '0x2222222222222222222222222222222222222222' as Address,
    ];

    const activity: MarketMaker['activity'] = marketMakerAddresses.map((address, i) => ({
      address,
      buyVolume: (1000000 + i * 100000).toString(),
      sellVolume: (950000 + i * 95000).toString(),
      spread: 0.5 + i * 0.1,
      frequency: 100 + i * 10,
    }));

    const impact: 'low' | 'medium' | 'high' = activity.length > 2 ? 'high' : activity.length > 0 ? 'medium' : 'low';

    const marketMaker: MarketMaker = {
      tokenAddress,
      hasMarketMaker,
      marketMakerAddresses,
      activity,
      impact,
    };

    return NextResponse.json({
      success: true,
      ...marketMaker,
      type: 'market-maker',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to detect market maker activity' },
      { status: 500 }
    );
  }
}

