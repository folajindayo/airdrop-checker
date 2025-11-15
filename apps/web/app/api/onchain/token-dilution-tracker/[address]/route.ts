import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-dilution-tracker/[address]
 * Track token dilution from new mints
 * Monitors supply expansion impact
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
    const cacheKey = `onchain-dilution:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const dilution: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      dilutionRate: 0,
      supplyIncrease: 0,
      holderImpact: 0,
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const totalSupply = parseFloat(response.data.total_supply || '0');
        const circulatingSupply = parseFloat(response.data.circulating_supply || '0');
        dilution.supplyIncrease = totalSupply - circulatingSupply;
        dilution.dilutionRate = circulatingSupply > 0 ? 
          (dilution.supplyIncrease / circulatingSupply) * 100 : 0;
        dilution.riskLevel = dilution.dilutionRate > 20 ? 'high' :
                            dilution.dilutionRate > 10 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error tracking dilution:', error);
    }

    cache.set(cacheKey, dilution, 5 * 60 * 1000);

    return NextResponse.json(dilution);
  } catch (error) {
    console.error('Token dilution tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track token dilution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

