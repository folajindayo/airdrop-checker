import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/wallet-reputation/[address]
 * Calculate wallet reputation score based on on-chain activity
 * Uses multiple factors for comprehensive reputation assessment
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
    const cacheKey = `onchain-wallet-reputation:${normalizedAddress}:${chainId || 'all'}`;
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

    const reputation: any = {
      address: normalizedAddress,
      reputationScore: 0,
      factors: {
        age: 0,
        activity: 0,
        diversity: 0,
        volume: 0,
        consistency: 0,
      },
      badges: [] as string[],
      riskIndicators: [] as string[],
      timestamp: Date.now(),
    };

    let totalTransactions = 0;
    let totalValue = 0;
    const protocols = new Set<string>();
    const firstTxDate = new Date();
    const lastTxDate = new Date(0);

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
          totalTransactions += transactions.length;

          transactions.forEach((tx: any) => {
            totalValue += parseFloat(tx.value_quote || '0');
            
            const txDate = new Date(tx.block_signed_at);
            if (txDate < firstTxDate) firstTxDate.setTime(txDate.getTime());
            if (txDate > lastTxDate) lastTxDate.setTime(txDate.getTime());

            if (tx.to_address_label) {
              protocols.add(tx.to_address_label);
            }
          });
        }
      } catch (error) {
        console.error(`Error analyzing reputation on ${chain.name}:`, error);
      }
    }

    const walletAge = (Date.now() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24);
    reputation.factors.age = Math.min(100, walletAge / 365 * 100);
    reputation.factors.activity = Math.min(100, totalTransactions / 100);
    reputation.factors.diversity = Math.min(100, protocols.size * 10);
    reputation.factors.volume = Math.min(100, Math.log10(totalValue + 1) * 10);

    reputation.reputationScore = Math.round(
      (reputation.factors.age * 0.3 +
       reputation.factors.activity * 0.25 +
       reputation.factors.diversity * 0.2 +
       reputation.factors.volume * 0.25)
    );

    reputation.badges = generateBadges(reputation);
    reputation.riskIndicators = identifyRisks(reputation);

    cache.set(cacheKey, reputation, 10 * 60 * 1000);

    return NextResponse.json(reputation);
  } catch (error) {
    console.error('Wallet reputation analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze wallet reputation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateBadges(reputation: any): string[] {
  const badges: string[] = [];

  if (reputation.factors.age > 80) badges.push('Veteran');
  if (reputation.factors.activity > 70) badges.push('Active');
  if (reputation.factors.diversity > 60) badges.push('Diverse');
  if (reputation.reputationScore > 80) badges.push('Trusted');

  return badges;
}

function identifyRisks(reputation: any): string[] {
  const risks: string[] = [];

  if (reputation.factors.age < 30) {
    risks.push('New wallet - limited history');
  }
  if (reputation.factors.activity < 10) {
    risks.push('Low activity level');
  }

  return risks;
}

