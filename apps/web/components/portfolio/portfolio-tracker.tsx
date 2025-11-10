'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/common/skeleton';

interface PortfolioData {
  totalValue: number;
  change24h: number;
  changePercent: number;
  chains: {
    name: string;
    value: number;
    percentage: number;
  }[];
  topTokens: {
    symbol: string;
    name: string;
    value: number;
    balance: string;
  }[];
}

interface PortfolioTrackerProps {
  address: string;
}

export function PortfolioTracker({ address }: PortfolioTrackerProps) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await fetch(`/api/portfolio/${address}`);
        if (response.ok) {
          const portfolioData = await response.json();
          setData(portfolioData);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setLoading(false);
      }
    }

    if (address) {
      fetchPortfolio();
    }
  }, [address]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const isPositive = data.changePercent >= 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Portfolio Value
        </CardTitle>
        <CardDescription>Total value across all chains</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Total Value Section */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold">
              ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
              isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {isPositive ? '+' : ''}${Math.abs(data.change24h).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (24h)
          </p>
        </div>

        {/* Chain Distribution */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Distribution by Chain
          </h4>
          <div className="space-y-3">
            {data.chains.map((chain) => (
              <div key={chain.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{chain.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${chain.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${chain.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{chain.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tokens */}
        {data.topTokens.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Top Holdings
            </h4>
            <div className="space-y-2">
              {data.topTokens.map((token, index) => (
                <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{token.balance}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    ${token.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

