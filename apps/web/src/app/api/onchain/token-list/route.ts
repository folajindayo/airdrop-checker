import { NextRequest, NextResponse } from 'next/server';

// Common token lists for major chains
const TOKEN_LISTS: Record<number, Array<{ address: string; symbol: string; name: string; decimals: number }>> = {
  1: [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8 },
  ],
  8453: [
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  42161: [
    { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  10: [
    { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  ],
  137: [
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC', name: 'Wrapped MATIC', decimals: 18 },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const symbol = searchParams.get('symbol');

    const tokenList = TOKEN_LISTS[chainId] || [];

    let filteredList = tokenList;
    if (symbol) {
      filteredList = tokenList.filter(
        (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      chainId,
      tokens: filteredList,
      totalTokens: filteredList.length,
      type: 'token_list',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token list' },
      { status: 500 }
    );
  }
}

