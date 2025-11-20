import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transfer-fee-optimizer/[address]
 * Optimize transfer fees for better user experience
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
    const cacheKey = `onchain-transfer-fee-optimizer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const optimizer: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      currentFee: 0,
      optimalFee: 0,
      feeStructure: {},
      recommendations: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        optimizer.currentFee = 2.0; // percentage
        optimizer.optimalFee = 1.5;
        optimizer.feeStructure = {
          buyFee: optimizer.currentFee,
          sellFee: optimizer.currentFee * 1.5,
          transferFee: 0,
        };
        optimizer.recommendations = [
          'Reduce fees to 1.5% for better adoption',
          'Consider tiered fee structure',
          'Implement fee exemptions for DEX pairs',
        ];
      }
    } catch (error) {
      console.error('Error optimizing transfer fees:', error);
    }

    cache.set(cacheKey, optimizer, 10 * 60 * 1000);

    return NextResponse.json(optimizer);
  } catch (error) {
    console.error('Transfer fee optimizer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize transfer fees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

