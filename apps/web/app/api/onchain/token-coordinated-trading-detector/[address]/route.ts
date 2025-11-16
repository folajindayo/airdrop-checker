import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-coordinated-trading-detector/[address]
 * Detect coordinated trading patterns across multiple addresses
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
    const cacheKey = `onchain-coordinated-trading:${normalizedAddress}:${chainId || 'all'}`;
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
      coordinatedTradingDetected: false,
      relatedAddresses: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        const addressMap = new Map<string, number>();
        
        transactions.forEach((tx: any) => {
          if (tx.to_address) {
            const addr = tx.to_address.toLowerCase();
            addressMap.set(addr, (addressMap.get(addr) || 0) + 1);
          }
        });
        
        const frequentAddresses = Array.from(addressMap.entries())
          .filter(([_, count]) => count > 3)
          .map(([addr, _]) => addr);
        
        detection.relatedAddresses = frequentAddresses;
        detection.coordinatedTradingDetected = frequentAddresses.length > 2;
      }
    } catch (error) {
      console.error('Error detecting coordinated trading:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Coordinated trading detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect coordinated trading patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

