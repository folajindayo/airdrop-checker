'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { Wallet, Coins, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PortfolioData {
  address: string;
  totalValue: number;
  chainBreakdown: Array<{
    chainId: number;
    chainName: string;
    value: number;
    tokenCount: number;
    percentage: number;
  }>;
  topTokens: Array<{
    address: string;
    name: string;
    symbol: string;
    balance: string;
    value: number;
    logo?: string;
  }>;
  totalTokens: number;
}

interface PortfolioTrackerProps {
  address: string;
}

export function PortfolioTracker({ address }: PortfolioTrackerProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, [address]);

  async function fetchPortfolio() {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${address}`);
      if (!response.ok) throw new Error('Failed to fetch portfolio');

      const data = await response.json();
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No portfolio data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Value Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Total Portfolio Value
          </CardTitle>
          <CardDescription>Combined value across all chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>{portfolio.totalTokens} tokens across {portfolio.chainBreakdown.length} chains</span>
          </div>
        </CardContent>
      </Card>

      {/* Chain Breakdown */}
      <div>
        <h2 className="text-2xl font-bold mb-4">By Chain</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolio.chainBreakdown
            .sort((a, b) => b.value - a.value)
            .map((chain) => (
              <Card key={chain.chainId}>
                <CardHeader>
                  <CardTitle className="text-lg">{chain.chainName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${chain.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Percentage</span>
                      <span>{chain.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tokens</span>
                      <span>{chain.tokenCount}</span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${chain.percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Top Tokens */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Top Tokens</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {portfolio.topTokens.map((token) => (
                <div key={token.address} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {token.logo ? (
                        <img src={token.logo} alt={token.symbol} className="w-8 h-8" />
                      ) : (
                        <Coins className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${token.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-sm text-muted-foreground">
                      {parseFloat(token.balance).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
