import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/staking-positions/[address]
 * Track staking positions for a wallet
 * Uses GoldRush API for staking token data
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
    const cacheKey = `onchain-staking-positions:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const positions: any[] = [];
    let totalValue = 0;

    for (const chain of targetChains) {
      try {
        // Get token balances
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'nft': 'false',
          }
        );

        if (response.data?.items) {
          const items = response.data.items;

          items.forEach((token: any) => {
            // Identify staking tokens
            const isStaking = token.contract_ticker_symbol?.includes('stETH') ||
                            token.contract_ticker_symbol?.includes('rETH') ||
                            token.contract_ticker_symbol?.includes('staked') ||
                            token.contract_name?.toLowerCase().includes('stake') ||
                            token.contract_name?.toLowerCase().includes('staked') ||
                            token.contract_name?.toLowerCase().includes('validator');

            if (isStaking && token.quote > 0) {
              const position = {
                chainId: chain.id,
                chainName: chain.name,
                stakingContract: token.contract_address,
                stakingTokenName: token.contract_name,
                stakingTokenSymbol: token.contract_ticker_symbol,
                stakedBalance: token.balance,
                stakedBalanceFormatted: token.pretty_quote,
                valueUSD: token.quote,
                logoUrl: token.logo_url,
                lastTransferDate: token.last_transferred_at,
              };

              positions.push(position);
              totalValue += token.quote || 0;
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching staking positions on ${chain.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      positions,
      summary: {
        totalPositions: positions.length,
        totalValueUSD: totalValue,
        byChain: chains.reduce((acc, chain) => {
          acc[chain.name] = positions
            .filter(p => p.chainId === chain.id)
            .reduce((sum, p) => sum + p.valueUSD, 0);
          return acc;
        }, {} as Record<string, number>),
      },
      timestamp: Date.now(),
    };

    // Cache for 2 minutes
    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain staking positions API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch staking positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

