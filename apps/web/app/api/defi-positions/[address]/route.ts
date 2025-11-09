import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface DeFiPosition {
  protocol: string;
  chainId: number;
  chainName: string;
  positionType: 'lp' | 'stake' | 'lend' | 'borrow' | 'farm';
  tokenSymbol: string;
  tokenAddress: string;
  balance: string;
  valueUSD: number;
  apy?: number;
  lastUpdated: string;
}

interface DeFiPositionsData {
  address: string;
  totalValue: number;
  positions: DeFiPosition[];
  byProtocol: Record<string, {
    protocol: string;
    totalValue: number;
    positionCount: number;
    chains: number[];
  }>;
  byChain: Record<number, {
    chainId: number;
    chainName: string;
    totalValue: number;
    positionCount: number;
  }>;
  timestamp: number;
}

// Common DeFi protocols to check
const DEFI_PROTOCOLS = [
  'uniswap',
  'sushiswap',
  'curve',
  'aave',
  'compound',
  'maker',
  'balancer',
  'yearn',
  'convex',
  'lido',
  'rocketpool',
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `defi-positions:${normalizedAddress}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const positions: DeFiPosition[] = [];
    const protocolMap = new Map<string, { totalValue: number; positionCount: number; chains: Set<number> }>();
    const chainMap = new Map<number, { totalValue: number; positionCount: number }>();

    // Fetch token balances and identify DeFi positions
    for (const chain of SUPPORTED_CHAINS) {
      try {
        const response = await goldrushClient.get(
          `/${chain.goldrushName}/address/${normalizedAddress}/balances_v2/`
        );

        if (response.data && response.data.items) {
          const tokens = response.data.items;

          tokens.forEach((token: any) => {
            const contractName = (token.contract_name || '').toLowerCase();
            const contractAddress = token.contract_address?.toLowerCase() || '';

            // Check if token is from a known DeFi protocol
            const protocolMatch = DEFI_PROTOCOLS.find((protocol) =>
              contractName.includes(protocol) ||
              contractAddress.includes(protocol)
            );

            if (protocolMatch && token.quote > 0) {
              // Determine position type based on token name/address
              let positionType: DeFiPosition['positionType'] = 'stake';
              if (contractName.includes('lp') || contractName.includes('pool')) {
                positionType = 'lp';
              } else if (contractName.includes('farm')) {
                positionType = 'farm';
              } else if (contractName.includes('lend') || contractName.includes('aave') || contractName.includes('compound')) {
                positionType = 'lend';
              }

              const position: DeFiPosition = {
                protocol: protocolMatch,
                chainId: chain.id,
                chainName: chain.name,
                positionType,
                tokenSymbol: token.contract_ticker_symbol || 'UNKNOWN',
                tokenAddress: contractAddress,
                balance: token.balance,
                valueUSD: token.quote || 0,
                lastUpdated: response.data.updated_at || new Date().toISOString(),
              };

              positions.push(position);

              // Update protocol map
              if (!protocolMap.has(protocolMatch)) {
                protocolMap.set(protocolMatch, {
                  totalValue: 0,
                  positionCount: 0,
                  chains: new Set(),
                });
              }
              const protocolData = protocolMap.get(protocolMatch)!;
              protocolData.totalValue += position.valueUSD;
              protocolData.positionCount += 1;
              protocolData.chains.add(chain.id);

              // Update chain map
              if (!chainMap.has(chain.id)) {
                chainMap.set(chain.id, { totalValue: 0, positionCount: 0 });
              }
              const chainData = chainMap.get(chain.id)!;
              chainData.totalValue += position.valueUSD;
              chainData.positionCount += 1;
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching DeFi positions for ${chain.name}:`, error);
      }
    }

    const totalValue = positions.reduce((sum, pos) => sum + pos.valueUSD, 0);

    const byProtocol: Record<string, any> = {};
    protocolMap.forEach((data, protocol) => {
      byProtocol[protocol] = {
        protocol,
        totalValue: data.totalValue,
        positionCount: data.positionCount,
        chains: Array.from(data.chains),
      };
    });

    const byChain: Record<number, any> = {};
    chainMap.forEach((data, chainId) => {
      const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
      byChain[chainId] = {
        chainId,
        chainName: chain?.name || `Chain ${chainId}`,
        totalValue: data.totalValue,
        positionCount: data.positionCount,
      };
    });

    const result: DeFiPositionsData = {
      address: normalizedAddress,
      totalValue,
      positions,
      byProtocol,
      byChain,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching DeFi positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DeFi positions' },
      { status: 500 }
    );
  }
}

