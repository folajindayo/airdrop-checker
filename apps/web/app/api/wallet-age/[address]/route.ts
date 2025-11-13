import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface WalletAgeMetrics {
  chainId: number;
  chainName: string;
  firstTransaction: string | null;
  lastTransaction: string | null;
  ageInDays: number;
  ageInMonths: number;
  transactionCount: number;
  isActive: boolean;
}

interface WalletAgeResponse {
  address: string;
  overallAgeInDays: number;
  overallAgeInMonths: number;
  overallAgeInYears: number;
  firstSeen: string | null;
  lastSeen: string | null;
  isActive: boolean;
  activityScore: number;
  metrics: WalletAgeMetrics[];
  summary: {
    oldestChain: string;
    newestChain: string;
    mostActiveChain: string;
    averageAgeInDays: number;
  };
  timestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, { data: WalletAgeResponse; expires: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `wallet-age:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const metrics: WalletAgeMetrics[] = [];
    let firstSeenOverall: string | null = null;
    let lastSeenOverall: string | null = null;
    let totalTransactions = 0;

    // Fetch wallet age data from all chains
    for (const chain of CHAINS) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        const response = await goldrushClient.get(
          `/v2/${chainName}/address/${address}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'page-size': 1, // Just need first transaction
          }
        );

        let firstTx: string | null = null;
        let lastTx: string | null = null;
        let txCount = 0;

        if (response.data?.items && response.data.items.length > 0) {
          const transactions = response.data.items;
          txCount = response.data.pagination?.total_count || transactions.length;
          
          // Get first transaction (oldest)
          const sortedByDate = [...transactions].sort((a, b) => 
            new Date(a.block_signed_at).getTime() - new Date(b.block_signed_at).getTime()
          );
          firstTx = sortedByDate[0].block_signed_at;
          
          // Get last transaction (newest)
          const sortedByDateDesc = [...transactions].sort((a, b) => 
            new Date(b.block_signed_at).getTime() - new Date(a.block_signed_at).getTime()
          );
          lastTx = sortedByDateDesc[0].block_signed_at;

          if (!firstSeenOverall || (firstTx && firstTx < firstSeenOverall)) {
            firstSeenOverall = firstTx;
          }
          if (!lastSeenOverall || (lastTx && lastTx > lastSeenOverall)) {
            lastSeenOverall = lastTx;
          }
        }

        if (firstTx) {
          const ageInMs = Date.now() - new Date(firstTx).getTime();
          const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
          const ageInMonths = Math.floor(ageInDays / 30);
          const daysSinceLastTx = lastTx 
            ? Math.floor((Date.now() - new Date(lastTx).getTime()) / (1000 * 60 * 60 * 24))
            : Infinity;
          const isActive = daysSinceLastTx <= 30; // Active if transaction in last 30 days

          metrics.push({
            chainId: chain.id,
            chainName: chain.name,
            firstTransaction: firstTx,
            lastTransaction: lastTx,
            ageInDays,
            ageInMonths,
            transactionCount: txCount,
            isActive,
          });

          totalTransactions += txCount;
        }
      } catch (error) {
        console.error(`Error fetching wallet age for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Calculate overall age
    let overallAgeInDays = 0;
    let overallAgeInMonths = 0;
    let overallAgeInYears = 0;

    if (firstSeenOverall) {
      const ageInMs = Date.now() - new Date(firstSeenOverall).getTime();
      overallAgeInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
      overallAgeInMonths = Math.floor(overallAgeInDays / 30);
      overallAgeInYears = Math.floor(overallAgeInDays / 365);
    }

    const daysSinceLastSeen = lastSeenOverall
      ? Math.floor((Date.now() - new Date(lastSeenOverall).getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;
    const isActiveOverall = daysSinceLastSeen <= 30;

    // Calculate activity score (0-100)
    const activityScore = Math.min(
      Math.floor(
        (totalTransactions / Math.max(overallAgeInDays, 1)) * 10 + // Transactions per day
        (metrics.filter(m => m.isActive).length / Math.max(metrics.length, 1)) * 50 + // Active chains
        (isActiveOverall ? 40 : 0) // Recent activity
      ),
      100
    );

    const oldestChain = metrics.sort((a, b) => a.ageInDays - b.ageInDays)[0]?.chainName || '';
    const newestChain = metrics.sort((a, b) => b.ageInDays - a.ageInDays)[0]?.chainName || '';
    const mostActiveChain = metrics.sort((a, b) => b.transactionCount - a.transactionCount)[0]?.chainName || '';
    const averageAgeInDays = metrics.length > 0
      ? Math.floor(metrics.reduce((sum, m) => sum + m.ageInDays, 0) / metrics.length)
      : 0;

    const result: WalletAgeResponse = {
      address: address.toLowerCase(),
      overallAgeInDays,
      overallAgeInMonths,
      overallAgeInYears,
      firstSeen: firstSeenOverall,
      lastSeen: lastSeenOverall,
      isActive: isActiveOverall,
      activityScore,
      metrics,
      summary: {
        oldestChain,
        newestChain,
        mostActiveChain,
        averageAgeInDays,
      },
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error calculating wallet age:', error);
    return NextResponse.json(
      { error: 'Failed to calculate wallet age', details: error.message },
      { status: 500 }
    );
  }
}

