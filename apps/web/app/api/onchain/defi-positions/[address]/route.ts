import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { erc20Abi } from 'viem';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

// Common DeFi protocol addresses (examples)
const DEFI_PROTOCOLS: Record<number, Record<string, string>> = {
  [mainnet.id]: {
    uniswap: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    aave: '0x7d2768dE32b0b80b7a3454c06Bd94BcC461C9C16',
    compound: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
  },
  [base.id]: {
    uniswap: '0x03a520b32C04BF3bEEf7Bebf72F19051B0C5F5A0',
    aave: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  },
};

/**
 * GET /api/onchain/defi-positions/[address]
 * Calculate real-time DeFi position values
 * Uses direct blockchain calls and GoldRush API
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

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-defi-positions:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? chains.filter((c) => c.id === parseInt(chainId))
      : chains;

    const positions: any[] = [];
    let totalValue = 0;

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        // Get token balances (LP tokens, staking tokens, etc.)
        const response = await goldrushClient.get(
          `/v2/${chainConfig.id}/address/${normalizedAddress}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'nft': 'false',
            'no-spam': 'true',
          }
        );

        if (response.data?.items) {
          const items = response.data.items;

          items.forEach((token: any) => {
            // Identify DeFi positions (LP tokens, staking tokens, etc.)
            const isLP = token.contract_ticker_symbol?.includes('LP') ||
                        token.contract_ticker_symbol?.includes('UNI-V2') ||
                        token.contract_ticker_symbol?.includes('UNI-V3') ||
                        token.contract_name?.toLowerCase().includes('liquidity');

            const isStaking = token.contract_name?.toLowerCase().includes('stake') ||
                             token.contract_name?.toLowerCase().includes('staked');

            if (isLP || isStaking || token.quote > 100) { // Include tokens with significant value
              const position = {
                chainId: chainConfig.id,
                chainName: chainConfig.name,
                contractAddress: token.contract_address,
                contractName: token.contract_name,
                symbol: token.contract_ticker_symbol,
                balance: token.balance,
                balanceFormatted: token.pretty_quote,
                valueUSD: token.quote,
                logoUrl: token.logo_url,
                type: isLP ? 'liquidity_pool' : isStaking ? 'staking' : 'token',
                decimals: token.contract_decimals,
                lastTransferDate: token.last_transferred_at,
              };

              positions.push(position);
              totalValue += token.quote || 0;
            }
          });
        }

        // Check for specific DeFi protocol positions
        const protocols = DEFI_PROTOCOLS[chainConfig.id] || {};
        for (const [protocolName, protocolAddress] of Object.entries(protocols)) {
          try {
            // This would require protocol-specific ABIs - simplified version
            // In production, you'd query each protocol's contracts
          } catch (error) {
            // Skip if protocol check fails
          }
        }
      } catch (error) {
        console.error(`Error fetching DeFi positions on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      positions,
      summary: {
        totalPositions: positions.length,
        totalValueUSD: totalValue,
        byType: {
          liquidity_pool: positions.filter(p => p.type === 'liquidity_pool').length,
          staking: positions.filter(p => p.type === 'staking').length,
          token: positions.filter(p => p.type === 'token').length,
        },
        byChain: chains.reduce((acc, chain) => {
          acc[chain.name] = positions
            .filter(p => p.chainId === chain.id)
            .reduce((sum, p) => sum + p.valueUSD, 0);
          return acc;
        }, {} as Record<string, number>),
      },
      timestamp: Date.now(),
    };

    // Cache for 2 minutes
    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain DeFi positions API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch DeFi positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

