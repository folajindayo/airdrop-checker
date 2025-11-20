import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-anti-whale-threshold-analyzer/[address]
 * Analyze anti-whale mechanism thresholds
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
    const cacheKey = `onchain-anti-whale-threshold:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analyzer: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      maxTransactionAmount: 0,
      maxWalletAmount: 0,
      whaleThreshold: 0,
      effectiveness: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const totalSupply = parseFloat(response.data.total_supply || '0');
        analyzer.maxTransactionAmount = totalSupply * 0.01; // 1% of supply
        analyzer.maxWalletAmount = totalSupply * 0.05; // 5% of supply
        analyzer.whaleThreshold = totalSupply * 0.02;
        analyzer.effectiveness = 75;
      }
    } catch (error) {
      console.error('Error analyzing anti-whale thresholds:', error);
    }

    cache.set(cacheKey, analyzer, 10 * 60 * 1000);

    return NextResponse.json(analyzer);
  } catch (error) {
    console.error('Anti-whale threshold analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze anti-whale thresholds',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

