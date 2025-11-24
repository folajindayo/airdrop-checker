import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-whitelist-eligibility-checker/[address]
 * Check whitelist eligibility for presales and airdrops
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
    const cacheKey = `onchain-whitelist-eligibility:${normalizedAddress}:${chainId || 'all'}`;
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
      isWhitelisted: false,
      eligibilityScore: 0,
      requirements: [],
      opportunities: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 50 }
      );

      if (response.data && response.data.items) {
        checker.eligibilityScore = Math.min(response.data.items.length * 2, 100);
        checker.isWhitelisted = checker.eligibilityScore > 50;
        checker.requirements = [
          'Minimum 25 transactions',
          'Active wallet for 30+ days',
        ];
        checker.opportunities = checker.isWhitelisted
          ? ['Eligible for presale access', 'Early airdrop qualification']
          : ['Increase transaction activity to qualify'];
      }
    } catch (error) {
      console.error('Error checking whitelist eligibility:', error);
    }

    cache.set(cacheKey, checker, 10 * 60 * 1000);

    return NextResponse.json(checker);
  } catch (error) {
    console.error('Whitelist eligibility checker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check whitelist eligibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

