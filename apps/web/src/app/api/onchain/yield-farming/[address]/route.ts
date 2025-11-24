import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/yield-farming/[address]
 * Track yield farming positions across DeFi protocols
 * Uses GoldRush API and Reown Wallet for secure access
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
    const cacheKey = `onchain-yield-farming:${normalizedAddress}:${chainId || 'all'}`;
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
            const isLP = token.contract_ticker_symbol?.includes('LP') ||
                        token.contract_ticker_symbol?.includes('UNI-V2') ||
                        token.contract_ticker_symbol?.includes('UNI-V3') ||
                        token.contract_name?.toLowerCase().includes('liquidity') ||
                        token.contract_name?.toLowerCase().includes('pool');

            if (isLP && token.quote > 0) {
              const position = {
                chainId: chain.id,
                chainName: chain.name,
                poolAddress: token.contract_address,
                poolName: token.contract_name,
                poolSymbol: token.contract_ticker_symbol,
                lpBalance: token.balance,
                lpBalanceFormatted: token.pretty_quote,
                valueUSD: token.quote,
                logoUrl: token.logo_url,
                lastTransferDate: token.last_transferred_at,
                estimatedAPY: null,
                protocol: detectProtocol(token.contract_name, token.contract_ticker_symbol),
              };

              positions.push(position);
              totalValue += token.quote || 0;
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching yield positions on ${chain.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      positions,
      summary: {
        totalPositions: positions.length,
        totalValueUSD: totalValue,
        byChain: targetChains.reduce((acc, chain) => {
          acc[chain.name] = positions
            .filter(p => p.chainId === chain.id)
            .reduce((sum, p) => sum + p.valueUSD, 0);
          return acc;
        }, {} as Record<string, number>),
        byProtocol: positions.reduce((acc, pos) => {
          const protocol = pos.protocol || 'Unknown';
          acc[protocol] = (acc[protocol] || 0) + pos.valueUSD;
          return acc;
        }, {} as Record<string, number>),
      },
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain yield farming API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch yield farming positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function detectProtocol(contractName?: string, symbol?: string): string {
  const name = (contractName || '').toLowerCase();
  const sym = (symbol || '').toLowerCase();

  if (name.includes('uniswap') || sym.includes('uni')) return 'Uniswap';
  if (name.includes('pancake') || sym.includes('cake')) return 'PancakeSwap';
  if (name.includes('sushi') || sym.includes('sushi')) return 'SushiSwap';
  if (name.includes('curve') || sym.includes('crv')) return 'Curve';
  if (name.includes('balancer') || sym.includes('bal')) return 'Balancer';
  if (name.includes('aave') || sym.includes('aave')) return 'Aave';
  if (name.includes('compound') || sym.includes('comp')) return 'Compound';

  return 'Unknown';
}

