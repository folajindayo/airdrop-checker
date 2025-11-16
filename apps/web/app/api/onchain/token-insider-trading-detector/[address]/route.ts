import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-insider-trading-detector/[address]
 * Detect potential insider trading patterns
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
    const cacheKey = `onchain-insider-trading:${normalizedAddress}:${chainId || 'all'}`;
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
      insiderTradingDetected: false,
      suspiciousScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        let score = 0;
        
        transactions.forEach((tx: any) => {
          if (tx.block_signed_at) {
            const txDate = new Date(tx.block_signed_at);
            const hoursSinceTx = (Date.now() - txDate.getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceTx < 1 && parseFloat(tx.value_quote || '0') > 10000) {
              score += 20;
            }
          }
        });
        
        detection.suspiciousScore = score;
        detection.insiderTradingDetected = score > 40;
      }
    } catch (error) {
      console.error('Error detecting insider trading:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Insider trading detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect insider trading patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

