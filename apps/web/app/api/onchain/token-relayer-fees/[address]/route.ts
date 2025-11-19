import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-relayer-fees/[address]
 * Track relayer fees and meta-transaction costs
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
    const cacheKey = `onchain-relayer-fees:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracking: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalRelayerFees: 0,
      avgFeePerTx: 0,
      relayerTransactions: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const relayerTxs = response.data.items.filter((tx: any) => 
          tx.gas_spent && parseFloat(tx.gas_spent) > 0
        );
        
        tracking.relayerTransactions = relayerTxs.map((tx: any) => ({
          hash: tx.tx_hash,
          fee: tx.gas_spent || '0',
        }));
        
        tracking.totalRelayerFees = relayerTxs.reduce((sum: number, tx: any) => 
          sum + parseFloat(tx.gas_spent || '0'), 0
        );
        
        tracking.avgFeePerTx = relayerTxs.length > 0 ? 
          tracking.totalRelayerFees / relayerTxs.length : 0;
      }
    } catch (error) {
      console.error('Error tracking relayer fees:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Relayer fees tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track relayer fees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





