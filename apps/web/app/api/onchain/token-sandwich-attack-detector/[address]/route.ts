import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-sandwich-attack-detector/[address]
 * Detect sandwich attack patterns in token swaps
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
    const cacheKey = `onchain-sandwich-attack:${normalizedAddress}:${chainId || 'all'}`;
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
      sandwichDetected: false,
      attackCount: 0,
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
        let attackCount = 0;
        
        transactions.forEach((tx: any, index: number) => {
          if (index > 0 && tx.gas_price) {
            const prevTx = transactions[index - 1];
            if (prevTx.gas_price && parseFloat(tx.gas_price) > parseFloat(prevTx.gas_price) * 1.1) {
              attackCount++;
            }
          }
        });
        
        detection.attackCount = attackCount;
        detection.sandwichDetected = attackCount > 0;
      }
    } catch (error) {
      console.error('Error detecting sandwich attacks:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Sandwich attack detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect sandwich attack patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





