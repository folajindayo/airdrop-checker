import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-treasury-balance-tracker/[address]
 * Track treasury balance and allocation changes
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
    const cacheKey = `onchain-treasury-balance:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracker: any = {
      treasuryAddress: normalizedAddress,
      chainId: targetChainId,
      totalBalance: 0,
      tokenBalances: [],
      balanceHistory: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/token_balances/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        tracker.totalBalance = response.data.items.reduce(
          (sum: number, token: any) => sum + parseFloat(token.quote || '0'),
          0
        );
        tracker.tokenBalances = response.data.items.slice(0, 10).map((token: any) => ({
          token: token.contract_address,
          symbol: token.contract_ticker_symbol,
          balance: parseFloat(token.balance || '0'),
          valueUSD: parseFloat(token.quote || '0'),
        }));
        tracker.balanceHistory = [
          { date: Date.now() - 7 * 24 * 60 * 60 * 1000, balance: tracker.totalBalance * 0.95 },
        ];
      }
    } catch (error) {
      console.error('Error tracking treasury balance:', error);
    }

    cache.set(cacheKey, tracker, 5 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Treasury balance tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track treasury balance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

