import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-sybil-attack-detector/[address]
 * Detect Sybil attack patterns with multiple related addresses
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
    const cacheKey = `onchain-sybil-attack:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const detection: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      sybilAttackDetected: false,
      relatedAddressCount: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        const uniqueAddresses = new Set<string>();
        
        transactions.forEach((tx: any) => {
          if (tx.to_address) uniqueAddresses.add(tx.to_address.toLowerCase());
          if (tx.from_address) uniqueAddresses.add(tx.from_address.toLowerCase());
        });
        
        detection.relatedAddressCount = uniqueAddresses.size;
        detection.sybilAttackDetected = uniqueAddresses.size > 20 && transactions.length < 50;
      }
    } catch (error) {
      console.error('Error detecting Sybil attacks:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Sybil attack detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect Sybil attack patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






