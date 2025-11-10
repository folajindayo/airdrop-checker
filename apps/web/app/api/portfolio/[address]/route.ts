import { NextRequest, NextResponse } from 'next/server';
import { getTokenBalances } from '@/lib/goldrush/tokens';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '7d';

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Fetch token balances from multiple chains
    const chains = [1, 8453, 42161, 10, 137]; // Ethereum, Base, Arbitrum, Optimism, Polygon
    const balancePromises = chains.map((chainId) =>
      getTokenBalances(address, chainId).catch(() => null)
    );

    const balancesResults = await Promise.all(balancePromises);
    
    // Process and aggregate data
    let totalValue = 0;
    const tokens: any[] = [];
    const chainDistribution: Record<string, number> = {};

    balancesResults.forEach((result, index) => {
      if (!result || !result.items) return;

      const chainId = chains[index];
      const chainName = getChainName(chainId);
      let chainValue = 0;

      result.items.forEach((item: any) => {
        const balance = parseFloat(item.balance) / Math.pow(10, item.contract_decimals || 18);
        const value = balance * (parseFloat(item.quote_rate) || 0);

        if (value > 0.01) { // Filter out dust
          totalValue += value;
          chainValue += value;

          tokens.push({
            symbol: item.contract_ticker_symbol,
            balance,
            value,
            change24h: Math.random() * 10 - 5, // Mock data - would need historical prices
            chainId,
            logo: item.logo_url,
          });
        }
      });

      if (chainValue > 0) {
        chainDistribution[chainName] = chainValue;
      }
    });

    // Sort tokens by value
    tokens.sort((a, b) => b.value - a.value);

    // Generate mock historical data (in production, fetch from price history API)
    const history = generateHistoricalData(totalValue, timeframe);

    // Calculate changes
    const change24h = Math.random() * 10 - 5; // Mock
    const change7d = Math.random() * 15 - 7.5; // Mock
    const change30d = Math.random() * 25 - 12.5; // Mock

    // Format chain distribution
    const chainDistributionArray = Object.entries(chainDistribution).map(([chain, value]) => ({
      chain,
      value,
      percentage: (value / totalValue) * 100,
    }));

    return NextResponse.json({
      totalValue,
      change24h,
      change7d,
      change30d,
      tokens: tokens.slice(0, 20), // Top 20 tokens
      history,
      chainDistribution: chainDistributionArray,
    });
  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

function getChainName(chainId: number): string {
  const names: Record<number, string> = {
    1: 'Ethereum',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    137: 'Polygon',
  };
  return names[chainId] || `Chain ${chainId}`;
}

function generateHistoricalData(currentValue: number, timeframe: string): { date: string; value: number }[] {
  const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 365;
  const data: { date: string; value: number }[] = [];
  
  for (let i = points; i >= 0; i--) {
    const date = new Date();
    if (timeframe === '24h') {
      date.setHours(date.getHours() - i);
    } else {
      date.setDate(date.getDate() - i);
    }
    
    // Generate realistic-looking historical values
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    const value = currentValue * (1 + variance * (i / points));
    
    data.push({
      date: timeframe === '24h' 
        ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value * 100) / 100,
    });
  }
  
  return data;
}

