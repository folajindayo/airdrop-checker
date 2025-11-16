import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-account-abstraction/[address]
 * Track account abstraction usage and smart contract wallets
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
    const cacheKey = `onchain-account-abstraction:${normalizedAddress}:${chainId || 'all'}`;
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
      isSmartWallet: false,
      userOperations: [],
      paymasterUsage: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const smartWalletTxs = response.data.items.filter((tx: any) => 
          tx.log_events && tx.log_events.length > 5
        );
        
        tracking.isSmartWallet = smartWalletTxs.length > 0;
        tracking.userOperations = smartWalletTxs.map((tx: any) => ({
          hash: tx.tx_hash,
          gasUsed: tx.gas_spent || '0',
        }));
        
        tracking.paymasterUsage = smartWalletTxs.filter((tx: any) => 
          tx.gas_spent && parseFloat(tx.gas_spent) === 0
        ).length;
      }
    } catch (error) {
      console.error('Error tracking account abstraction:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Account abstraction tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track account abstraction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

