import { NextRequest, NextResponse } from 'next/server';
import { goldRushClient } from '@/lib/goldrush/client';

interface RouteParams {
  params: {
    address: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { address } = params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Fetch token balances from multiple chains
    const chains = [1, 137, 56, 42161, 10]; // Ethereum, Polygon, BSC, Arbitrum, Optimism
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BNB Chain',
      42161: 'Arbitrum',
      10: 'Optimism'
    };

    let totalValue = 0;
    const chainDistribution: { [key: string]: number } = {};
    const allTokens: any[] = [];

    // Fetch balances for each chain
    for (const chainId of chains) {
      try {
        const balances = await goldRushClient.getTokenBalances(address, chainId);
        
        let chainValue = 0;
        balances.forEach((token: any) => {
          const value = parseFloat(token.quote || 0);
          chainValue += value;
          
          if (value > 0) {
            allTokens.push({
              symbol: token.contract_ticker_symbol,
              name: token.contract_name,
              value: value,
              balance: token.balance_formatted || '0',
              chainId: chainId
            });
          }
        });

        if (chainValue > 0) {
          chainDistribution[chainNames[chainId]] = chainValue;
          totalValue += chainValue;
        }
      } catch (error) {
        console.error(`Error fetching balances for chain ${chainId}:`, error);
      }
    }

    // Calculate percentages and format chain data
    const chains_data = Object.entries(chainDistribution).map(([name, value]) => ({
      name,
      value,
      percentage: (value / totalValue) * 100
    })).sort((a, b) => b.value - a.value);

    // Get top tokens by value
    const topTokens = allTokens
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Mock 24h change (in production, you'd compare with previous data)
    const change24h = totalValue * 0.03; // 3% mock increase
    const changePercent = 3.0;

    return NextResponse.json({
      totalValue,
      change24h,
      changePercent,
      chains: chains_data,
      topTokens
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

