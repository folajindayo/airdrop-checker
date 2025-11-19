import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-back-running-detector/[address]
 * Detect back-running patterns in transactions
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
    const cacheKey = `onchain-back-running:${normalizedAddress}:${chainId || 'all'}`;
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
      backRunningDetected: false,
      patternCount: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        let patternCount = 0;
        
        for (let i = 1; i < transactions.length; i++) {
          const prevTx = transactions[i - 1];
          const currTx = transactions[i];
          
          if (prevTx.block_number === currTx.block_number && 
              prevTx.gas_price && currTx.gas_price &&
              parseFloat(currTx.gas_price) < parseFloat(prevTx.gas_price)) {
            patternCount++;
          }
        }
        
        detection.patternCount = patternCount;
        detection.backRunningDetected = patternCount > 3;
      }
    } catch (error) {
      console.error('Error detecting back-running:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Back-running detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect back-running patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






