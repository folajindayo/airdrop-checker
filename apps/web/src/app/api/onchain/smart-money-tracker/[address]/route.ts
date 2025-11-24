import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/smart-money-tracker/[address]
 * Track smart money wallets and their strategies
 * Identifies profitable trading patterns
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
    const cacheKey = `onchain-smart-money:${normalizedAddress}:${chainId || 'all'}`;
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

    const tracker: any = {
      address: normalizedAddress,
      isSmartMoney: false,
      profitability: {
        totalProfitUSD: 0,
        winRate: 0,
        averageProfit: 0,
        roi: 0,
      },
      strategies: [] as string[],
      topTokens: [] as any[],
      timestamp: Date.now(),
    };

    let profitableTrades = 0;
    let totalTrades = 0;
    const tokenPerformance = new Map<string, number>();

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          const transactions = response.data.items;
          
          transactions.forEach((tx: any) => {
            if (tx.log_events?.some((e: any) => e.decoded?.name === 'Swap')) {
              totalTrades++;
              const value = parseFloat(tx.value_quote || '0');
              
              if (value > 0) {
                profitableTrades++;
                tracker.profitability.totalProfitUSD += value;
              }

              const tokenAddress = tx.log_events?.[0]?.sender_address;
              if (tokenAddress) {
                tokenPerformance.set(
                  tokenAddress,
                  (tokenPerformance.get(tokenAddress) || 0) + value
                );
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error tracking smart money on ${chain.name}:`, error);
      }
    }

    if (totalTrades > 0) {
      tracker.profitability.winRate = (profitableTrades / totalTrades) * 100;
      tracker.profitability.averageProfit = tracker.profitability.totalProfitUSD / totalTrades;
    }

    tracker.topTokens = Array.from(tokenPerformance.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address, profit]) => ({ address, profitUSD: profit }));

    tracker.isSmartMoney = tracker.profitability.winRate > 60 && 
                           tracker.profitability.totalProfitUSD > 10000;
    
    tracker.strategies = identifyStrategies(tracker);

    cache.set(cacheKey, tracker, 5 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Smart money tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track smart money',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function identifyStrategies(tracker: any): string[] {
  const strategies: string[] = [];

  if (tracker.profitability.winRate > 70) {
    strategies.push('High win rate trader');
  }
  if (tracker.topTokens.length > 5) {
    strategies.push('Diversified portfolio');
  }

  return strategies;
}

