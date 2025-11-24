import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/activity-patterns/[address]
 * Detect patterns in wallet activity and behavior
 * Uses Reown Wallet transaction data for analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const days = parseInt(searchParams.get('days') || '90');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-activity-patterns:${normalizedAddress}:${chainId || 'all'}:${days}`;
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

    const patterns: any = {
      address: normalizedAddress,
      timePatterns: {
        mostActiveHour: 0,
        mostActiveDay: '',
        activityByHour: {} as Record<number, number>,
        activityByDay: {} as Record<string, number>,
      },
      transactionPatterns: {
        averageValue: 0,
        commonRecipients: [] as any[],
        commonContracts: [] as any[],
        transactionTypes: {} as Record<string, number>,
      },
      behaviorPatterns: {
        isBot: false,
        isWhale: false,
        isTrader: false,
        isHolder: false,
        activityLevel: 'low',
      },
      insights: [] as string[],
      timestamp: Date.now(),
    };

    let totalTransactions = 0;
    let totalValue = 0;
    const recipients = new Map<string, number>();
    const contracts = new Map<string, number>();
    const hours = new Map<number, number>();
    const days = new Map<string, number>();

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
            totalTransactions++;
            totalValue += parseFloat(tx.value_quote || '0');

            const txDate = new Date(tx.block_signed_at);
            const hour = txDate.getHours();
            const day = txDate.toISOString().split('T')[0];

            hours.set(hour, (hours.get(hour) || 0) + 1);
            days.set(day, (days.get(day) || 0) + 1);

            if (tx.to_address) {
              recipients.set(tx.to_address, (recipients.get(tx.to_address) || 0) + 1);
            }

            if (tx.to_address && tx.to_address !== normalizedAddress) {
              contracts.set(tx.to_address, (contracts.get(tx.to_address) || 0) + 1);
            }

            const txType = detectTransactionType(tx);
            patterns.transactionPatterns.transactionTypes[txType] = 
              (patterns.transactionPatterns.transactionTypes[txType] || 0) + 1;
          });
        }
      } catch (error) {
        console.error(`Error analyzing activity patterns on ${chain.name}:`, error);
      }
    }

    patterns.timePatterns.mostActiveHour = Array.from(hours.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    patterns.timePatterns.mostActiveDay = Array.from(days.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    patterns.transactionPatterns.averageValue = totalTransactions > 0 
      ? totalValue / totalTransactions 
      : 0;

    patterns.transactionPatterns.commonRecipients = Array.from(recipients.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address, count]) => ({ address, count }));

    patterns.transactionPatterns.commonContracts = Array.from(contracts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address, count]) => ({ address, count }));

    patterns.behaviorPatterns = analyzeBehavior(totalTransactions, totalValue, patterns);
    patterns.insights = generateInsights(patterns);

    cache.set(cacheKey, patterns, 10 * 60 * 1000);

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Activity pattern analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze activity patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function detectTransactionType(tx: any): string {
  if (tx.log_events?.length > 0) {
    if (tx.log_events.some((e: any) => e.decoded?.name === 'Transfer')) return 'token_transfer';
    if (tx.log_events.some((e: any) => e.decoded?.name === 'Swap')) return 'swap';
    if (tx.log_events.some((e: any) => e.decoded?.name === 'Approval')) return 'approval';
  }
  if (parseFloat(tx.value || '0') > 0) return 'native_transfer';
  return 'contract_call';
}

function analyzeBehavior(totalTx: number, totalValue: number, patterns: any): any {
  const avgValue = totalTx > 0 ? totalValue / totalTx : 0;
  const txPerDay = totalTx / 90;
  
  const isBot = totalTx > 1000 && patterns.timePatterns.mostActiveHour === 0;
  const isWhale = avgValue > 100000;
  const isTrader = patterns.transactionPatterns.transactionTypes['swap'] > totalTx * 0.3;
  const isHolder = totalTx < 10 && avgValue > 10000;
  
  let activityLevel = 'low';
  if (txPerDay > 10) activityLevel = 'very_high';
  else if (txPerDay > 5) activityLevel = 'high';
  else if (txPerDay > 1) activityLevel = 'medium';

  return {
    isBot,
    isWhale,
    isTrader,
    isHolder,
    activityLevel,
  };
}

function generateInsights(patterns: any): string[] {
  const insights: string[] = [];

  if (patterns.behaviorPatterns.isBot) {
    insights.push('Wallet shows bot-like activity patterns');
  }
  if (patterns.behaviorPatterns.isWhale) {
    insights.push('Wallet exhibits whale behavior with large transactions');
  }
  if (patterns.behaviorPatterns.isTrader) {
    insights.push('Active trading detected - frequent swap transactions');
  }
  if (patterns.behaviorPatterns.isHolder) {
    insights.push('Wallet appears to be a long-term holder');
  }

  if (patterns.timePatterns.mostActiveHour >= 0 && patterns.timePatterns.mostActiveHour <= 6) {
    insights.push('Most active during early morning hours (UTC)');
  }

  return insights;
}

