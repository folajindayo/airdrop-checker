import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface LiquidityPosition {
  chainId: number;
  chainName: string;
  protocol: string;
  poolAddress: string;
  token0: string;
  token0Symbol: string;
  token1: string;
  token1Symbol: string;
  lpTokenBalance: string;
  lpTokenBalanceFormatted: string;
  shareOfPool: number;
  valueUSD: number;
  apr?: number;
  lastUpdated: string;
}

interface LPPositionsResponse {
  address: string;
  totalPositions: number;
  totalValueUSD: number;
  positions: LiquidityPosition[];
  byProtocol: Record<string, {
    protocol: string;
    positionCount: number;
    totalValueUSD: number;
    positions: LiquidityPosition[];
  }>;
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    positionCount: number;
    totalValueUSD: number;
    positions: LiquidityPosition[];
  }>;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: LPPositionsResponse; expires: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `lp-positions:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const positions: LiquidityPosition[] = [];
    let totalValueUSD = 0;

    // Fetch LP positions from all chains
    for (const chain of CHAINS) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        const response = await goldrushClient.get(
          `/v2/${chainName}/address/${address}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'nft': false,
            'no-spam': true,
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          for (const item of response.data.items) {
            // Detect LP tokens (typically have specific naming patterns)
            const contractName = (item.contract_name || '').toLowerCase();
            const contractSymbol = (item.contract_ticker_symbol || '').toLowerCase();
            
            const isLPToken = contractName.includes('lp') || 
                             contractName.includes('liquidity') ||
                             contractSymbol.includes('lp') ||
                             contractName.includes('uniswap') ||
                             contractName.includes('pancake') ||
                             contractName.includes('sushiswap');

            if (isLPToken) {
              const usdValue = parseFloat(item.quote || '0');
              const balance = item.balance || '0';
              const decimals = item.contract_decimals || 18;
              const balanceFormatted = (parseFloat(balance) / Math.pow(10, decimals)).toFixed(6);

              // Try to extract protocol name
              let protocol = 'Unknown';
              if (contractName.includes('uniswap')) protocol = 'Uniswap';
              else if (contractName.includes('pancake')) protocol = 'PancakeSwap';
              else if (contractName.includes('sushi')) protocol = 'SushiSwap';
              else if (contractName.includes('curve')) protocol = 'Curve';
              else if (contractName.includes('balancer')) protocol = 'Balancer';

              positions.push({
                chainId: chain.id,
                chainName: chain.name,
                protocol,
                poolAddress: item.contract_address || '',
                token0: '', // Would need separate API call to get pool details
                token0Symbol: '',
                token1: '',
                token1Symbol: '',
                lpTokenBalance: balance,
                lpTokenBalanceFormatted: balanceFormatted,
                shareOfPool: 0, // Would need pool total supply
                valueUSD: usdValue,
                lastUpdated: new Date().toISOString(),
              });

              totalValueUSD += usdValue;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching LP positions for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by protocol
    const byProtocol: Record<string, any> = {};
    for (const position of positions) {
      if (!byProtocol[position.protocol]) {
        byProtocol[position.protocol] = {
          protocol: position.protocol,
          positionCount: 0,
          totalValueUSD: 0,
          positions: [],
        };
      }
      byProtocol[position.protocol].positionCount++;
      byProtocol[position.protocol].totalValueUSD += position.valueUSD;
      byProtocol[position.protocol].positions.push(position);
    }

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const position of positions) {
      if (!byChain[position.chainName]) {
        byChain[position.chainName] = {
          chainId: position.chainId,
          chainName: position.chainName,
          positionCount: 0,
          totalValueUSD: 0,
          positions: [],
        };
      }
      byChain[position.chainName].positionCount++;
      byChain[position.chainName].totalValueUSD += position.valueUSD;
      byChain[position.chainName].positions.push(position);
    }

    const result: LPPositionsResponse = {
      address: address.toLowerCase(),
      totalPositions: positions.length,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      positions: positions.sort((a, b) => b.valueUSD - a.valueUSD),
      byProtocol,
      byChain,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching LP positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LP positions', details: error.message },
      { status: 500 }
    );
  }
}

