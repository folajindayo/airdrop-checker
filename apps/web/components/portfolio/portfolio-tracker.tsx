'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Wallet, Coins, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

interface PortfolioTrackerProps {
  address: string;
  className?: string;
}

interface PortfolioData {
  address: string;
  totalValue: number;
  chainBreakdown: Array<{
    chainId: number;
    chainName: string;
    value: number;
    tokenCount: number;
  }>;
  topTokens: Array<{
    symbol: string;
    name: string;
    balance: string;
    value: number;
    chainId: number;
    chainName: string;
    logoUrl?: string;
  }>;
  timestamp: number;
}

export function PortfolioTracker({ address, className = '' }: PortfolioTrackerProps) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchPortfolio() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/portfolio/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        
        const portfolioData = await response.json();
        setData(portfolioData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [address]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Portfolio Tracker</CardTitle>
          <CardDescription>Error loading portfolio data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (balance: string, decimals: number = 18) => {
    const num = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const whole = num / divisor;
    const fraction = num % divisor;
    
    if (fraction === 0n) {
      return whole.toString();
    }
    
    const fractionStr = fraction.toString().padStart(decimals, '0');
    const trimmed = fractionStr.replace(/0+$/, '');
    return `${whole}.${trimmed}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Portfolio Tracker
        </CardTitle>
        <CardDescription>Your token holdings across all chains</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tokens">Top Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(data.totalValue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Chain Distribution</h3>
              <div className="space-y-2">
                {data.chainBreakdown.map((chain) => {
                  const percentage = (chain.value / data.totalValue) * 100;
                  const chainInfo = SUPPORTED_CHAINS.find((c) => c.id === chain.chainId);
                  
                  return (
                    <div key={chain.chainId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{chain.chainName}</span>
                          <Badge variant="secondary">{chain.tokenCount} tokens</Badge>
                        </div>
                        <span className="font-semibold">{formatCurrency(chain.value)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-4 mt-4">
            <div className="space-y-2">
              {data.topTokens.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No tokens found
                </p>
              ) : (
                data.topTokens.map((token, index) => (
                  <div
                    key={`${token.symbol}-${token.chainId}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {token.logoUrl ? (
                        <img
                          src={token.logoUrl}
                          alt={token.symbol}
                          className="h-8 w-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Coins className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {token.name} • {token.chainName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(token.value)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBalance(token.balance)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

