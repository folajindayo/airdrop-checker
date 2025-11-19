import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-flash-loan-detector/[address]
 * Detect flash loan usage patterns in token transactions
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
    const cacheKey = `onchain-flash-loan-detector:${normalizedAddress}:${chainId || 'all'}`;
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
      flashLoanDetected: false,
      flashLoanProtocols: [],
      suspiciousPatterns: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const flashLoanProtocols = ['Aave', 'dYdX', 'Uniswap', 'Balancer'];
        const transactions = response.data.items;
        
        detection.flashLoanProtocols = flashLoanProtocols.filter(protocol => 
          transactions.some((tx: any) => 
            tx.to_address?.toLowerCase().includes(protocol.toLowerCase())
          )
        );
        
        detection.flashLoanDetected = detection.flashLoanProtocols.length > 0;
      }
    } catch (error) {
      console.error('Error detecting flash loans:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Flash loan detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect flash loan patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





