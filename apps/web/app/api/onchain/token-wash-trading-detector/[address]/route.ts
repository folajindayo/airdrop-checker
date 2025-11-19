import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-wash-trading-detector/[address]
 * Detect wash trading patterns in token transactions
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
    const cacheKey = `onchain-wash-trading:${normalizedAddress}:${chainId || 'all'}`;
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
      washTradingDetected: false,
      suspiciousTxPairs: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        let suspiciousPairs = 0;
        
        for (let i = 0; i < transactions.length - 1; i++) {
          const tx1 = transactions[i];
          const tx2 = transactions[i + 1];
          
          if (tx1.to_address === tx2.from_address && 
              tx1.from_address === tx2.to_address &&
              tx1.value === tx2.value) {
            suspiciousPairs++;
          }
        }
        
        detection.suspiciousTxPairs = suspiciousPairs;
        detection.washTradingDetected = suspiciousPairs > 2;
      }
    } catch (error) {
      console.error('Error detecting wash trading:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Wash trading detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect wash trading patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





