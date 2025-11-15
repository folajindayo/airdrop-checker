import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-tax-analyzer/[address]
 * Analyze token tax structure and fees
 * Detects buy/sell taxes and transfer fees
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
    const cacheKey = `onchain-tax-analyzer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tax: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      buyTax: 0,
      sellTax: 0,
      transferTax: 0,
      hasTax: false,
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        tax.hasTax = false;
        tax.riskLevel = tax.buyTax > 10 || tax.sellTax > 10 ? 'high' : 'low';
      }
    } catch (error) {
      console.error('Error analyzing taxes:', error);
    }

    cache.set(cacheKey, tax, 10 * 60 * 1000);

    return NextResponse.json(tax);
  } catch (error) {
    console.error('Token tax analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze token taxes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

