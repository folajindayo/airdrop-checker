import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/contract-interactions/[address]
 * Track all smart contract interactions for a wallet
 * Uses GoldRush API for contract interaction data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const contractAddress = searchParams.get('contract');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-contract-interactions:${normalizedAddress}:${chainId || 'all'}:${contractAddress || 'all'}`;
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

    const interactions: any[] = [];
    const contractStats = new Map<string, any>();

    for (const chain of targetChains) {
      try {
        const params: any = {
          'quote-currency': 'USD',
          'format': 'json',
          'page-size': 100,
        };

        if (contractAddress && isValidAddress(contractAddress)) {
          params['contract-address'] = contractAddress.toLowerCase();
        }

        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          params
        );

        if (response.data?.items) {
          const items = response.data.items;

          items.forEach((tx: any) => {
            // Only include contract interactions (not simple transfers)
            if (tx.log_events && tx.log_events.length > 0) {
              const contractAddr = tx.to_address?.toLowerCase();
              if (contractAddr && (!contractAddress || contractAddr === contractAddress.toLowerCase())) {
                const interaction = {
                  chainId: chain.id,
                  chainName: chain.name,
                  txHash: tx.tx_hash,
                  blockHeight: tx.block_height,
                  blockSignedAt: tx.block_signed_at,
                  contractAddress: contractAddr,
                  contractName: tx.to_address_label,
                  value: tx.value,
                  valueQuote: tx.value_quote,
                  gasSpent: tx.gas_spent,
                  gasQuote: tx.gas_quote,
                  logEvents: tx.log_events,
                  functionCalls: tx.log_events.map((log: any) => ({
                    name: log.decoded?.name,
                    signature: log.decoded?.signature,
                    params: log.decoded?.params,
                  })),
                };

                interactions.push(interaction);

                // Update contract stats
                if (!contractStats.has(contractAddr)) {
                  contractStats.set(contractAddr, {
                    contractAddress: contractAddr,
                    contractName: tx.to_address_label,
                    chainId: chain.id,
                    chainName: chain.name,
                    interactionCount: 0,
                    totalValue: 0,
                    totalGasSpent: 0,
                    firstInteraction: tx.block_signed_at,
                    lastInteraction: tx.block_signed_at,
                    functionCalls: new Set<string>(),
                  });
                }

                const stats = contractStats.get(contractAddr)!;
                stats.interactionCount += 1;
                stats.totalValue += tx.value_quote || 0;
                stats.totalGasSpent += tx.gas_spent || 0;
                
                if (tx.block_signed_at < stats.firstInteraction) {
                  stats.firstInteraction = tx.block_signed_at;
                }
                if (tx.block_signed_at > stats.lastInteraction) {
                  stats.lastInteraction = tx.block_signed_at;
                }

                tx.log_events.forEach((log: any) => {
                  if (log.decoded?.name) {
                    stats.functionCalls.add(log.decoded.name);
                  }
                });
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching contract interactions on ${chain.name}:`, error);
      }
    }

    // Convert Set to Array for functionCalls
    const contractStatsArray = Array.from(contractStats.values()).map((stats) => ({
      ...stats,
      functionCalls: Array.from(stats.functionCalls),
    }));

    const result = {
      address: normalizedAddress,
      interactions: interactions.slice(0, 200), // Limit to 200 most recent
      contractStats: contractStatsArray,
      totalInteractions: interactions.length,
      uniqueContracts: contractStatsArray.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain contract interactions API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch contract interactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

