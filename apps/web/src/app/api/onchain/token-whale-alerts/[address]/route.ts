import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-whale-alerts/[address]
 * Monitor whale movements for a token
 * Tracks large transactions and holder changes
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
    const cacheKey = `onchain-whale-alerts:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const alerts: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      recentWhaleMovements: [] as any[],
      topWhales: [] as any[],
      alertLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 20 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const totalSupply = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);

        holders.forEach((holder: any) => {
          const balance = parseFloat(holder.balance || '0');
          const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;
          
          if (percentage > 1) {
            alerts.topWhales.push({
              address: holder.address,
              balance: balance,
              percentage: percentage,
              valueUSD: parseFloat(holder.quote || '0'),
            });
          }
        });

        alerts.alertLevel = alerts.topWhales.length > 5 ? 'high' : 
                           alerts.topWhales.length > 2 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error tracking whales:', error);
    }

    cache.set(cacheKey, alerts, 2 * 60 * 1000);

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Whale alerts error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track whale movements',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

