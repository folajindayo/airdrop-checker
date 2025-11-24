import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-mev-bot-detector/[address]
 * Detect MEV bot activity patterns
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-mev-bot-detector:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const detection: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      mevBotDetected: false,
      mevScore: 0,
      patterns: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        let mevScore = 0;
        
        transactions.forEach((tx: any) => {
          if (tx.gas_price && tx.gas_used) {
            const gasPrice = parseFloat(tx.gas_price || '0');
            if (gasPrice > 100) mevScore += 10;
          }
        });
        
        detection.mevScore = mevScore;
        detection.mevBotDetected = mevScore > 50;
      }
    } catch (error) {
      console.error('Error detecting MEV bots:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('MEV bot detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect MEV bot patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






