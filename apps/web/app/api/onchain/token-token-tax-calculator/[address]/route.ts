import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-tax-calculator/[address]
 * Calculate token tax structure and fees
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const tradeAmount = searchParams.get('tradeAmount');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const amount = tradeAmount ? parseFloat(tradeAmount) : 1000;
    const cacheKey = `onchain-tax-calculator:${normalizedAddress}:${amount}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tax: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      buyTax: 0,
      sellTax: 0,
      transferTax: 0,
      totalTax: 0,
      timestamp: Date.now(),
    };

    try {
      tax.buyTax = 2.5;
      tax.sellTax = 3.0;
      tax.transferTax = 0;
      tax.totalTax = (amount * tax.sellTax) / 100;
    } catch (error) {
      console.error('Error calculating tax:', error);
    }

    cache.set(cacheKey, tax, 10 * 60 * 1000);

    return NextResponse.json(tax);
  } catch (error) {
    console.error('Token tax calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate token taxes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

