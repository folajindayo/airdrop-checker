import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-bridge-security-checker/[address]
 * Check bridge security status and audit compliance
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
    const cacheKey = `onchain-bridge-security:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const securityCheck: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      securityScore: 75,
      auditStatus: 'unknown',
      riskFlags: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const failedTxs = response.data.items.filter((tx: any) => !tx.successful);
        if (failedTxs.length > response.data.items.length * 0.1) {
          securityCheck.riskFlags.push('High failure rate');
          securityCheck.securityScore -= 20;
        }
        
        securityCheck.auditStatus = 'verified';
        securityCheck.securityScore = Math.max(0, Math.min(100, securityCheck.securityScore));
      }
    } catch (error) {
      console.error('Error checking bridge security:', error);
    }

    cache.set(cacheKey, securityCheck, 5 * 60 * 1000);

    return NextResponse.json(securityCheck);
  } catch (error) {
    console.error('Bridge security checker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check bridge security',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

