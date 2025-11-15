import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/cross-chain-portfolio/[address]
 * Aggregate portfolio value across all supported chains
 * Uses Reown Wallet for multi-chain access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-cross-chain-portfolio:${normalizedAddress}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const portfolio: any = {
      address: normalizedAddress,
      totalValueUSD: 0,
      byChain: {} as Record<string, any>,
      byAsset: {} as Record<string, any>,
      summary: {
        totalChains: 0,
        totalTokens: 0,
        totalNFTs: 0,
        totalDeFiPositions: 0,
      },
      timestamp: Date.now(),
    };

    const allTokens = new Map<string, any>();

    for (const chain of SUPPORTED_CHAINS) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'nft': 'false',
          }
        );

        if (response.data?.items) {
          const chainPortfolio = {
            chainId: chain.id,
            chainName: chain.name,
            totalValueUSD: 0,
            tokens: [] as any[],
            nativeBalance: '0',
            nativeValueUSD: 0,
          };

          response.data.items.forEach((token: any) => {
            if (token.type === 'cryptocurrency') {
              const tokenKey = `${token.contract_address || 'native'}:${chain.id}`;
              
              if (!allTokens.has(tokenKey)) {
                allTokens.set(tokenKey, {
                  symbol: token.contract_ticker_symbol || 'Native',
                  name: token.contract_name || chain.name,
                  address: token.contract_address,
                  chains: [],
                  totalValueUSD: 0,
                });
              }

              const tokenData = allTokens.get(tokenKey)!;
              tokenData.chains.push({
                chainId: chain.id,
                chainName: chain.name,
                balance: token.balance,
                valueUSD: token.quote,
              });
              tokenData.totalValueUSD += token.quote || 0;

              if (token.contract_address) {
                chainPortfolio.tokens.push({
                  address: token.contract_address,
                  symbol: token.contract_ticker_symbol,
                  name: token.contract_name,
                  balance: token.balance,
                  valueUSD: token.quote,
                });
                chainPortfolio.totalValueUSD += token.quote || 0;
              } else {
                chainPortfolio.nativeBalance = token.balance;
                chainPortfolio.nativeValueUSD = token.quote || 0;
                chainPortfolio.totalValueUSD += token.quote || 0;
              }
            }
          });

          portfolio.byChain[chain.name] = chainPortfolio;
          portfolio.totalValueUSD += chainPortfolio.totalValueUSD;
          portfolio.summary.totalChains++;
          portfolio.summary.totalTokens += chainPortfolio.tokens.length;
        }

        const nftResponse = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'nft': 'true',
          }
        );

        if (nftResponse.data?.items) {
          const nftCount = nftResponse.data.items.length;
          portfolio.summary.totalNFTs += nftCount;
        }
      } catch (error) {
        console.error(`Error fetching portfolio on ${chain.name}:`, error);
      }
    }

    portfolio.byAsset = Array.from(allTokens.values())
      .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
      .reduce((acc, token) => {
        acc[token.symbol] = token;
        return acc;
      }, {} as Record<string, any>);

    portfolio.summary.topAssets = Array.from(allTokens.values())
      .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
      .slice(0, 10)
      .map(t => ({
        symbol: t.symbol,
        valueUSD: t.totalValueUSD,
        chains: t.chains.length,
      }));

    cache.set(cacheKey, portfolio, 2 * 60 * 1000);

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Cross-chain portfolio aggregation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to aggregate cross-chain portfolio',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

