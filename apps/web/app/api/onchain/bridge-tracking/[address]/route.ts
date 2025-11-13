import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Common bridge contract addresses
const BRIDGE_CONTRACTS: Record<number, string[]> = {
  [1]: [ // Ethereum
    '0x4D9079Bb4165aeb4084c526a32695dCfd2F77381', // Stargate
    '0x3d4Cc8A61c7528Fd86C55cfe061a78EBA0bE1EdF', // Hop Protocol
    '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1', // Optimism Bridge
  ],
  [42161]: [ // Arbitrum
    '0x72Ce9c84678fcf5773585282c2A5140Ee5C2C462', // Arbitrum Bridge
  ],
  [10]: [ // Optimism
    '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1', // Optimism Bridge
  ],
};

/**
 * GET /api/onchain/bridge-tracking/[address]
 * Track cross-chain bridge usage for a wallet
 * Uses GoldRush API for transaction data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-bridge-tracking:${normalizedAddress}:${chainId || 'all'}:${days}`;
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

    const bridgeTransactions: any[] = [];
    const bridgeStats: Record<string, any> = {};

    for (const chain of targetChains) {
      try {
        const bridgeContracts = BRIDGE_CONTRACTS[chain.id] || [];
        
        // Get transactions
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 100,
            'block-signed-at-asc': 'false',
          }
        );

        if (response.data?.items) {
          const items = response.data.items;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);

          items.forEach((tx: any) => {
            const txDate = new Date(tx.block_signed_at);
            if (txDate >= cutoffDate) {
              // Check if transaction is with a bridge contract
              const toAddress = tx.to_address?.toLowerCase();
              const isBridgeTx = bridgeContracts.some(bridge => 
                bridge.toLowerCase() === toAddress
              );

              if (isBridgeTx) {
                const bridgeName = bridgeContracts.find(b => 
                  b.toLowerCase() === toAddress
                ) || 'Unknown Bridge';

                bridgeTransactions.push({
                  chainId: chain.id,
                  chainName: chain.name,
                  txHash: tx.tx_hash,
                  blockHeight: tx.block_height,
                  blockSignedAt: tx.block_signed_at,
                  bridgeAddress: toAddress,
                  bridgeName,
                  from: tx.from_address,
                  to: tx.to_address,
                  value: tx.value,
                  valueQuote: tx.value_quote,
                  gasSpent: tx.gas_spent,
                  gasQuote: tx.gas_quote,
                });

                // Update stats
                if (!bridgeStats[bridgeName]) {
                  bridgeStats[bridgeName] = {
                    bridgeName,
                    transactionCount: 0,
                    totalValue: 0,
                    totalGasSpent: 0,
                    chains: new Set(),
                  };
                }

                bridgeStats[bridgeName].transactionCount += 1;
                bridgeStats[bridgeName].totalValue += tx.value_quote || 0;
                bridgeStats[bridgeName].totalGasSpent += tx.gas_quote || 0;
                bridgeStats[bridgeName].chains.add(chain.name);
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching bridge transactions on ${chain.name}:`, error);
      }
    }

    // Convert Set to Array
    Object.keys(bridgeStats).forEach(key => {
      bridgeStats[key].chains = Array.from(bridgeStats[key].chains);
    });

    const result = {
      address: normalizedAddress,
      bridgeTransactions: bridgeTransactions.slice(0, 100), // Limit to 100 most recent
      bridgeStats: Object.values(bridgeStats),
      summary: {
        totalBridgeTransactions: bridgeTransactions.length,
        uniqueBridges: Object.keys(bridgeStats).length,
        totalValueBridged: bridgeTransactions.reduce((sum, tx) => sum + (tx.valueQuote || 0), 0),
        totalGasSpent: bridgeTransactions.reduce((sum, tx) => sum + (tx.gasQuote || 0), 0),
      },
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain bridge tracking API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track bridge usage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

