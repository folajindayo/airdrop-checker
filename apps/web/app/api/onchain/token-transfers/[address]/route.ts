import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transfers/[address]
 * Get token transfer history for a wallet
 * Uses GoldRush API for transfer data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const tokenAddress = searchParams.get('token');
    const direction = searchParams.get('direction'); // 'in', 'out', or 'both'

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-token-transfers:${normalizedAddress}:${chainId || 'all'}:${tokenAddress || 'all'}:${direction || 'both'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const transfers: any[] = [];
    const tokenStats = new Map<string, any>();

    for (const chain of targetChains) {
      try {
        const params: any = {
          'quote-currency': 'USD',
          'format': 'json',
          'page-size': 100,
        };

        if (tokenAddress && isValidAddress(tokenAddress)) {
          params['contract-address'] = tokenAddress.toLowerCase();
        }

        // Get transfers
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          params
        );

        if (response.data?.items) {
          const items = response.data.items;

          items.forEach((tx: any) => {
            // Check if this is a token transfer
            const hasTokenTransfers = tx.log_events?.some((log: any) => 
              log.decoded?.name === 'Transfer' || 
              log.sender_name === 'Transfer'
            );

            if (hasTokenTransfers || tx.value > 0) {
              const isIncoming = tx.to_address?.toLowerCase() === normalizedAddress;
              const isOutgoing = tx.from_address?.toLowerCase() === normalizedAddress;

              if (
                (direction === 'in' && isIncoming) ||
                (direction === 'out' && isOutgoing) ||
                (!direction || direction === 'both')
              ) {
                const transfer = {
                  chainId: chain.id,
                  chainName: chain.name,
                  txHash: tx.tx_hash,
                  blockHeight: tx.block_height,
                  blockSignedAt: tx.block_signed_at,
                  from: tx.from_address,
                  to: tx.to_address,
                  value: tx.value,
                  valueQuote: tx.value_quote,
                  tokenAddress: tx.to_address, // For native transfers, this is the recipient
                  direction: isIncoming ? 'in' : 'out',
                  gasSpent: tx.gas_spent,
                  gasQuote: tx.gas_quote,
                  logEvents: tx.log_events?.filter((log: any) => 
                    log.decoded?.name === 'Transfer'
                  ) || [],
                };

                transfers.push(transfer);

                // Track token stats
                if (tx.log_events) {
                  tx.log_events.forEach((log: any) => {
                    if (log.decoded?.name === 'Transfer' && log.sender_address) {
                      const tokenAddr = log.sender_address.toLowerCase();
                      if (!tokenStats.has(tokenAddr)) {
                        tokenStats.set(tokenAddr, {
                          tokenAddress: tokenAddr,
                          chainId: chain.id,
                          chainName: chain.name,
                          transferCount: 0,
                          totalIn: 0,
                          totalOut: 0,
                          firstTransfer: tx.block_signed_at,
                          lastTransfer: tx.block_signed_at,
                        });
                      }

                      const stats = tokenStats.get(tokenAddr)!;
                      stats.transferCount += 1;
                      
                      if (isIncoming) {
                        stats.totalIn += tx.value_quote || 0;
                      } else {
                        stats.totalOut += tx.value_quote || 0;
                      }

                      if (tx.block_signed_at < stats.firstTransfer) {
                        stats.firstTransfer = tx.block_signed_at;
                      }
                      if (tx.block_signed_at > stats.lastTransfer) {
                        stats.lastTransfer = tx.block_signed_at;
                      }
                    }
                  });
                }
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching token transfers on ${chain.name}:`, error);
      }
    }

    // Sort by most recent
    transfers.sort((a, b) => 
      new Date(b.blockSignedAt).getTime() - new Date(a.blockSignedAt).getTime()
    );

    const result = {
      address: normalizedAddress,
      transfers: transfers.slice(0, 200), // Limit to 200 most recent
      tokenStats: Array.from(tokenStats.values()),
      totalTransfers: transfers.length,
      uniqueTokens: tokenStats.size,
      summary: {
        incoming: transfers.filter(t => t.direction === 'in').length,
        outgoing: transfers.filter(t => t.direction === 'out').length,
        totalValueIn: transfers
          .filter(t => t.direction === 'in')
          .reduce((sum, t) => sum + (t.valueQuote || 0), 0),
        totalValueOut: transfers
          .filter(t => t.direction === 'out')
          .reduce((sum, t) => sum + (t.valueQuote || 0), 0),
      },
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token transfers API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch token transfers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

