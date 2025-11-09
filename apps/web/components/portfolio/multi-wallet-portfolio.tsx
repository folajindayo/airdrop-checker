'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Wallet, Plus, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MultiWalletPortfolioProps {
  className?: string;
}

interface MultiWalletPortfolioData {
  wallets: Array<{
    address: string;
    totalValue: number;
    tokenCount: number;
    chainCount: number;
  }>;
  aggregate: {
    totalValue: number;
    uniqueTokens: number;
    chainsUsed: number;
    walletCount: number;
  };
  chainDistribution: Array<{
    chainId: number;
    chainName: string;
    totalValue: number;
    walletCount: number;
  }>;
  topHoldings: Array<{
    symbol: string;
    totalValue: number;
    walletCount: number;
    chains: number[];
  }>;
  timestamp: number;
}

export function MultiWalletPortfolio({ className = '' }: MultiWalletPortfolioProps) {
  const [addresses, setAddresses] = useState<string[]>(['']);
  const [data, setData] = useState<MultiWalletPortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddressChange(index: number, value: string) {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  }

  function handleAddAddress() {
    if (addresses.length >= 10) {
      toast.error('Maximum 10 wallets allowed');
      return;
    }
    setAddresses([...addresses, '']);
  }

  function handleRemoveAddress(index: number) {
    if (addresses.length === 1) {
      toast.error('At least one wallet is required');
      return;
    }
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses);
  }

  async function fetchPortfolio() {
    const validAddresses = addresses.filter(
      (addr) => addr && /^0x[a-fA-F0-9]{40}$/.test(addr)
    );

    if (validAddresses.length === 0) {
      toast.error('Please add at least one valid wallet address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/multi-wallet-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: validAddresses }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio');
      }

      const portfolioData = await response.json();
      setData(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to fetch multi-wallet portfolio');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Multi-Wallet Portfolio
        </CardTitle>
        <CardDescription>Aggregate view of multiple wallets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Inputs */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Wallet Addresses</Label>
          {addresses.map((address, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="0x..."
                value={address}
                onChange={(e) => handleAddressChange(index, e.target.value)}
                className="font-mono text-sm"
              />
              {addresses.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAddress(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddAddress}
              disabled={addresses.length >= 10}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
            <Button onClick={fetchPortfolio} disabled={loading}>
              {loading ? 'Loading...' : 'Load Portfolio'}
            </Button>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* Aggregate Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(data.aggregate.totalValue)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Wallets</p>
                <p className="text-2xl font-bold mt-1">{data.aggregate.walletCount}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Unique Tokens</p>
                <p className="text-2xl font-bold mt-1">{data.aggregate.uniqueTokens}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Chains</p>
                <p className="text-2xl font-bold mt-1">{data.aggregate.chainsUsed}</p>
              </div>
            </div>

            {/* Wallet Breakdown */}
            <div>
              <h3 className="font-semibold mb-3">Wallet Breakdown</h3>
              <div className="space-y-2">
                {data.wallets.map((wallet) => (
                  <div
                    key={wallet.address}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">{wallet.address}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{wallet.tokenCount} tokens</span>
                        <span>{wallet.chainCount} chains</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold">{formatCurrency(wallet.totalValue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chain Distribution */}
            {data.chainDistribution.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Chain Distribution</h3>
                <div className="space-y-2">
                  {data.chainDistribution.map((chain) => {
                    const percentage = (chain.totalValue / data.aggregate.totalValue) * 100;
                    return (
                      <div key={chain.chainId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{chain.chainName}</span>
                            <Badge variant="secondary">
                              {chain.walletCount} wallet{chain.walletCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(chain.totalValue)}
                          </span>
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
            )}

            {/* Top Holdings */}
            {data.topHoldings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Top Holdings</h3>
                <div className="space-y-2">
                  {data.topHoldings.slice(0, 10).map((holding) => (
                    <div
                      key={holding.symbol}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{holding.symbol}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Held in {holding.walletCount} wallet{holding.walletCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(holding.totalValue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add Label import
import { Label } from '@/components/ui/label';

