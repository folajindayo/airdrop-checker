import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { fetchAllChainTokenBalances, calculateTotalValue } from '@/lib/goldrush/tokens';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/portfolio/[address]
 * Get portfolio value and token breakdown for a wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `portfolio:${normalizedAddress}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    // Fetch token balances across all chains
    const chainTokens = await fetchAllChainTokenBalances(normalizedAddress);
    const totalValue = calculateTotalValue(chainTokens);

    // Calculate breakdown by chain
    const chainBreakdown = SUPPORTED_CHAINS.map((chain) => {
      const tokens = chainTokens[chain.id] || [];
      const chainValue = tokens.reduce((sum, token) => sum + (token.quote || 0), 0);
      return {
        chainId: chain.id,
        chainName: chain.name,
        value: chainValue,
        tokenCount: tokens.length,
        percentage: totalValue > 0 ? (chainValue / totalValue) * 100 : 0,
      };
    });

    // Get top tokens by value
    const allTokens = Object.values(chainTokens).flat();
    const topTokens = allTokens
      .filter((token) => token.quote > 0)
      .sort((a, b) => b.quote - a.quote)
      .slice(0, 20)
      .map((token) => ({
        address: token.contract_address,
        name: token.contract_name,
        symbol: token.contract_ticker_symbol,
        balance: token.balance,
        value: token.quote,
        logo: token.logo_url,
        decimals: token.contract_decimals,
        isNative: token.native_token,
      }));

    const result = {
      address: normalizedAddress,
      totalValue,
      chainBreakdown,
      topTokens,
      totalTokens: allTokens.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch portfolio data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
