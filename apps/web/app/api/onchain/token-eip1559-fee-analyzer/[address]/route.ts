import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-eip1559-fee-analyzer/[address]
 * Analyze EIP-1559 fee structure and base fee trends
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
    const cacheKey = `onchain-eip1559-fee:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analysis: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      eip1559Compliant: false,
      baseFeeTrend: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items.filter((tx: any) => tx.gas_price);
        if (transactions.length > 0) {
          analysis.eip1559Compliant = targetChainId === 1;
          const fees = transactions.map((tx: any) => parseFloat(tx.gas_price));
          const variance = Math.max(...fees) - Math.min(...fees);
          analysis.baseFeeTrend = variance > 50 ? 'volatile' : 'stable';
        }
      }
    } catch (error) {
      console.error('Error analyzing EIP-1559 fees:', error);
    }

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('EIP-1559 fee analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze EIP-1559 fee structure',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





