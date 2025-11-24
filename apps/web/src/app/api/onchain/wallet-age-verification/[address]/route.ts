import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/wallet-age-verification/[address]
 * Verify wallet age and first transaction date
 * Useful for airdrop eligibility verification
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
    const cacheKey = `onchain-wallet-age:${normalizedAddress}:${chainId || 'all'}`;
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

    const verification: any = {
      address: normalizedAddress,
      walletAge: 0,
      firstTransaction: null as any,
      lastTransaction: null as any,
      isVerified: false,
      ageCategory: 'new',
      timestamp: Date.now(),
    };

    let earliestDate = new Date();
    let latestDate = new Date(0);

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 1,
            'order': 'asc',
          }
        );

        if (response.data?.items?.[0]) {
          const firstTx = response.data.items[0];
          const txDate = new Date(firstTx.block_signed_at);
          if (txDate < earliestDate) {
            earliestDate = txDate;
            verification.firstTransaction = {
              hash: firstTx.tx_hash,
              date: firstTx.block_signed_at,
              chainId: chain.id,
            };
          }
        }

        const lastResponse = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 1,
            'order': 'desc',
          }
        );

        if (lastResponse.data?.items?.[0]) {
          const lastTx = lastResponse.data.items[0];
          const txDate = new Date(lastTx.block_signed_at);
          if (txDate > latestDate) {
            latestDate = txDate;
            verification.lastTransaction = {
              hash: lastTx.tx_hash,
              date: lastTx.block_signed_at,
              chainId: chain.id,
            };
          }
        }
      } catch (error) {
        console.error(`Error verifying age on ${chain.name}:`, error);
      }
    }

    if (verification.firstTransaction) {
      verification.walletAge = (Date.now() - earliestDate.getTime()) / (1000 * 60 * 60 * 24);
      verification.isVerified = verification.walletAge > 30;
      
      if (verification.walletAge > 365) verification.ageCategory = 'veteran';
      else if (verification.walletAge > 180) verification.ageCategory = 'established';
      else if (verification.walletAge > 30) verification.ageCategory = 'active';
      else verification.ageCategory = 'new';
    }

    cache.set(cacheKey, verification, 24 * 60 * 60 * 1000);

    return NextResponse.json(verification);
  } catch (error) {
    console.error('Wallet age verification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify wallet age',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

