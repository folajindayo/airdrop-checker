import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface TokenBalance {
  chainId: number;
  chainName: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: string;
  balanceFormatted: string;
  usdValue: number;
  decimals: number;
}

interface TokenBalancesResponse {
  address: string;
  totalValueUSD: number;
  tokenCount: number;
  balances: TokenBalance[];
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    value: number;
    tokenCount: number;
    tokens: TokenBalance[];
  }>;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: TokenBalancesResponse; expires: number }>();

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
    const cacheKey = `token-balances:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const balances: TokenBalance[] = [];
    let totalValueUSD = 0;

    // Fetch balances from all chains
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
            const balance = item.balance || '0';
            const usdValue = parseFloat(item.quote || '0');
            
            balances.push({
              chainId: chain.id,
              chainName: chain.name,
              tokenAddress: item.contract_address || '',
              tokenSymbol: item.contract_ticker_symbol || '',
              tokenName: item.contract_name || '',
              balance: balance,
              balanceFormatted: (parseFloat(balance) / Math.pow(10, item.contract_decimals || 18)).toFixed(6),
              usdValue: usdValue,
              decimals: item.contract_decimals || 18,
            });

            totalValueUSD += usdValue;
          }
        }
      } catch (error) {
        console.error(`Error fetching balances for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const balance of balances) {
      const chainKey = balance.chainName;
      if (!byChain[chainKey]) {
        byChain[chainKey] = {
          chainId: balance.chainId,
          chainName: balance.chainName,
          value: 0,
          tokenCount: 0,
          tokens: [],
        };
      }
      byChain[chainKey].value += balance.usdValue;
      byChain[chainKey].tokenCount += 1;
      byChain[chainKey].tokens.push(balance);
    }

    const result: TokenBalancesResponse = {
      address: address.toLowerCase(),
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      tokenCount: balances.length,
      balances: balances.sort((a, b) => b.usdValue - a.usdValue),
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
    console.error('Error fetching token balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balances', details: error.message },
      { status: 500 }
    );
  }
}

