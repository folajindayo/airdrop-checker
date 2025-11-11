import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/activity-score/[address]
 * Calculate on-chain activity score based on wallet behavior
 * Uses GoldRush API for comprehensive activity analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '90');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-activity-score:${normalizedAddress}:${days}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    let totalTransactions = 0;
    let totalValue = 0;
    let uniqueContracts = new Set<string>();
    let chainsUsed = new Set<number>();
    let nftCount = 0;
    let defiInteractions = 0;
    let bridgeUsage = 0;

    // Analyze activity across all chains
    for (const chain of SUPPORTED_CHAINS) {
      try {
        // Get transactions
        const txResponse = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 100,
          }
        );

        if (txResponse.data?.items) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);

          txResponse.data.items.forEach((tx: any) => {
            const txDate = new Date(tx.block_signed_at);
            if (txDate >= cutoffDate) {
              totalTransactions += 1;
              totalValue += tx.value_quote || 0;
              
              if (tx.to_address) {
                uniqueContracts.add(tx.to_address.toLowerCase());
              }

              if (tx.log_events && tx.log_events.length > 0) {
                defiInteractions += 1;
              }
            }
          });

          chainsUsed.add(chain.id);
        }

        // Get NFT count
        try {
          const nftResponse = await goldrushClient.get(
            `/v2/${chain.id}/address/${normalizedAddress}/balances_nft/`,
            {
              'quote-currency': 'USD',
              'format': 'json',
              'nft': 'true',
            }
          );

          if (nftResponse.data?.items) {
            nftCount += nftResponse.data.items.length;
          }
        } catch {
          // No NFTs or error
        }
      } catch (error) {
        console.error(`Error analyzing activity on ${chain.name}:`, error);
      }
    }

    // Calculate activity score (0-100)
    const transactionScore = Math.min(totalTransactions / 10, 30); // Max 30 points
    const valueScore = Math.min(Math.log10(totalValue + 1) * 5, 25); // Max 25 points
    const diversityScore = Math.min(uniqueContracts.size / 5, 20); // Max 20 points
    const chainScore = Math.min(chainsUsed.size * 5, 15); // Max 15 points
    const nftScore = Math.min(nftCount / 2, 5); // Max 5 points
    const defiScore = Math.min(defiInteractions / 5, 5); // Max 5 points

    const activityScore = Math.round(
      transactionScore +
      valueScore +
      diversityScore +
      chainScore +
      nftScore +
      defiScore
    );

    const result = {
      address: normalizedAddress,
      activityScore: Math.min(activityScore, 100),
      breakdown: {
        transactionScore: Math.round(transactionScore),
        valueScore: Math.round(valueScore),
        diversityScore: Math.round(diversityScore),
        chainScore: Math.round(chainScore),
        nftScore: Math.round(nftScore),
        defiScore: Math.round(defiScore),
      },
      metrics: {
        totalTransactions,
        totalValueUSD: totalValue,
        uniqueContracts: uniqueContracts.size,
        chainsUsed: chainsUsed.size,
        nftCount,
        defiInteractions,
        bridgeUsage,
      },
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      level: activityScore >= 80 ? 'high' : activityScore >= 50 ? 'medium' : 'low',
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain activity score API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate activity score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

