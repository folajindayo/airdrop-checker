import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-bridge-fee-calculator/[address]
 * Calculate bridge fees and compare across protocols
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
    const cacheKey = `onchain-bridge-fees:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const calculation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalBridgeFees: 0,
      avgFeePercent: 0,
      feeBreakdown: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const bridgeTxs = response.data.items.filter((tx: any) => tx.gas_spent);
        let totalFees = 0;
        
        bridgeTxs.forEach((tx: any) => {
          const fee = parseFloat(tx.gas_spent || '0');
          totalFees += fee;
        });
        
        calculation.totalBridgeFees = totalFees;
        if (bridgeTxs.length > 0) {
          calculation.avgFeePercent = (totalFees / bridgeTxs.length) / 100;
        }
      }
    } catch (error) {
      console.error('Error calculating bridge fees:', error);
    }

    cache.set(cacheKey, calculation, 5 * 60 * 1000);

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Bridge fee calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate bridge fees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






