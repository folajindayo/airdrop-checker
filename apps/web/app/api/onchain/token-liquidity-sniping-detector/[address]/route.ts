import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-sniping-detector/[address]
 * Detect liquidity sniping patterns in token launches
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
    const cacheKey = `onchain-liquidity-sniping:${normalizedAddress}:${chainId || 'all'}`;
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
      snipingDetected: false,
      earlyTxCount: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        let earlyTxCount = 0;
        
        transactions.forEach((tx: any) => {
          if (tx.block_number && tx.block_signed_at) {
            const txDate = new Date(tx.block_signed_at);
            const now = new Date();
            const hoursDiff = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff < 24 && tx.gas_price && parseFloat(tx.gas_price) > 50) {
              earlyTxCount++;
            }
          }
        });
        
        detection.earlyTxCount = earlyTxCount;
        detection.snipingDetected = earlyTxCount > 3;
      }
    } catch (error) {
      console.error('Error detecting liquidity sniping:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Liquidity sniping detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect liquidity sniping patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






