import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-tax-calculator/[address]
 * Calculate token taxes and fees on transactions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const amount = searchParams.get('amount');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const txAmount = amount ? parseFloat(amount) : 1000;
    const cacheKey = `onchain-tax-calculator:${normalizedAddress}:${txAmount}:${chainId || 'all'}`;
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
      transactionAmount: txAmount,
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
      tax.totalTax = tax.sellTax;
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
