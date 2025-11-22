import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-snapshot-eligibility-checker/[address]
 * Check wallet eligibility for airdrop snapshots
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const snapshotDate = searchParams.get('snapshotDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-snapshot-eligibility:${normalizedAddress}:${snapshotDate}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const checker: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      snapshotDate,
      isEligible: false,
      balanceAtSnapshot: 0,
      eligibilityScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/token_balances/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        const totalBalance = response.data.items.reduce(
          (sum: number, token: any) => sum + parseFloat(token.quote || '0'),
          0
        );
        checker.balanceAtSnapshot = totalBalance;
        checker.isEligible = totalBalance > 100; // minimum threshold
        checker.eligibilityScore = Math.min((totalBalance / 1000) * 100, 100);
      }
    } catch (error) {
      console.error('Error checking snapshot eligibility:', error);
    }

    cache.set(cacheKey, checker, 10 * 60 * 1000);

    return NextResponse.json(checker);
  } catch (error) {
    console.error('Snapshot eligibility checker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check snapshot eligibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


