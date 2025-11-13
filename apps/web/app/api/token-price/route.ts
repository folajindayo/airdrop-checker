import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/token-price
 * Get token prices for airdrop tokens
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const chain = searchParams.get('chain') || 'ethereum';

    // Mock token price data (in production, fetch from CoinGecko, CoinMarketCap, etc.)
    const tokenPrices: Record<string, any> = {
      'ARB': {
        symbol: 'ARB',
        name: 'Arbitrum',
        price: 1.25,
        change24h: 2.5,
        marketCap: 1500000000,
        volume24h: 50000000,
        chain: 'arbitrum',
      },
      'OP': {
        symbol: 'OP',
        name: 'Optimism',
        price: 2.10,
        change24h: -1.2,
        marketCap: 800000000,
        volume24h: 30000000,
        chain: 'optimism',
      },
      'MATIC': {
        symbol: 'MATIC',
        name: 'Polygon',
        price: 0.85,
        change24h: 0.5,
        marketCap: 7000000000,
        volume24h: 200000000,
        chain: 'polygon',
      },
      'ETH': {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 2500,
        change24h: 1.8,
        marketCap: 300000000000,
        volume24h: 10000000000,
        chain: 'ethereum',
      },
    };

    if (token) {
      const tokenData = tokenPrices[token.toUpperCase()];
      if (!tokenData) {
        return NextResponse.json(
          { error: `Token ${token} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        token: tokenData,
        timestamp: new Date().toISOString(),
      });
    }

    // Return all tokens or filter by chain
    const filteredTokens = chain !== 'all'
      ? Object.values(tokenPrices).filter((t: any) => t.chain === chain)
      : Object.values(tokenPrices);

    return NextResponse.json({
      success: true,
      tokens: filteredTokens,
      count: filteredTokens.length,
      chain: chain === 'all' ? 'all' : chain,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Token price API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch token prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



