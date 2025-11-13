import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface TokenPrice {
  chainId: number;
  chainName: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  priceUSD: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: string;
}

interface TokenPricesResponse {
  tokens: TokenPrice[];
  byChain: Record<string, TokenPrice[]>;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (prices change frequently)
const cache = new Map<string, { data: TokenPricesResponse; expires: number }>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const tokenAddress = searchParams.get('tokenAddress');
    
    // Check cache
    const cacheKey = `token-prices:${chainId || 'all'}:${tokenAddress || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const tokens: TokenPrice[] = [];
    const chainsToCheck = chainId 
      ? CHAINS.filter(c => c.id.toString() === chainId)
      : CHAINS;

    // Fetch token prices from chains
    for (const chain of chainsToCheck) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        
        // Get token balances to find tokens
        const response = await goldrushClient.get(
          `/v2/${chainName}/tokens/`,
          {
            'quote-currency': 'USD',
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          for (const item of response.data.items) {
            if (tokenAddress && item.contract_address?.toLowerCase() !== tokenAddress.toLowerCase()) {
              continue;
            }

            const priceUSD = parseFloat(item.quote_rate || '0');
            const priceChange24h = parseFloat(item.quote_rate_24h || '0') - priceUSD;
            const priceChangePercent24h = priceUSD > 0 
              ? (priceChange24h / priceUSD) * 100 
              : 0;

            tokens.push({
              chainId: chain.id,
              chainName: chain.name,
              tokenAddress: item.contract_address || '',
              tokenSymbol: item.contract_ticker_symbol || '',
              tokenName: item.contract_name || '',
              priceUSD: Math.round(priceUSD * 10000) / 10000,
              priceChange24h: Math.round(priceChange24h * 10000) / 10000,
              priceChangePercent24h: Math.round(priceChangePercent24h * 100) / 100,
              marketCap: item.market_cap ? parseFloat(item.market_cap) : undefined,
              volume24h: item.volume_24h ? parseFloat(item.volume_24h) : undefined,
              lastUpdated: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching token prices for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by chain
    const byChain: Record<string, TokenPrice[]> = {};
    for (const token of tokens) {
      if (!byChain[token.chainName]) {
        byChain[token.chainName] = [];
      }
      byChain[token.chainName].push(token);
    }

    const result: TokenPricesResponse = {
      tokens: tokens.sort((a, b) => b.priceUSD - a.priceUSD),
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
    console.error('Error fetching token prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token prices', details: error.message },
      { status: 500 }
    );
  }
}

