'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BatchWalletCheckerProps {
  className?: string;
}

interface BatchResult {
  address: string;
  overallScore: number;
  totalValue: number;
  airdropCount: number;
  topAirdrop: {
    projectId: string;
    score: number;
  };
  error?: string;
}

interface BatchResponse {
  results: BatchResult[];
  summary: {
    totalChecked: number;
    successful: number;
    failed: number;
    averageScore: number;
    totalValue: number;
  };
  timestamp: number;
}

export function BatchWalletChecker({ className = '' }: BatchWalletCheckerProps) {
  const [addresses, setAddresses] = useState<string[]>(['']);
  const [results, setResults] = useState<BatchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  function handleAddressChange(index: number, value: string) {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  }

  function handleAddAddress() {
    if (addresses.length >= 20) {
      toast.error('Maximum 20 wallets allowed');
      return;
    }
    setAddresses([...addresses, '']);
  }

  function handleRemoveAddress(index: number) {
    if (addresses.length === 1) {
      toast.error('At least one wallet is required');
      return;
    }
    setAddresses(addresses.filter((_, i) => i !== index));
  }

  async function handleBatchCheck() {
    const validAddresses = addresses.filter(
      (addr) => addr && /^0x[a-fA-F0-9]{40}$/.test(addr)
    );

    if (validAddresses.length === 0) {
      toast.error('Please add at least one valid wallet address');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/batch-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: validAddresses }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform batch check');
      }

      const batchData = await response.json();
      setResults(batchData);
      toast.success(`Checked ${batchData.summary.successful} wallets successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to perform batch check');
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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Batch Wallet Checker</CardTitle>
        <CardDescription>Check up to 20 wallets at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Inputs */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Wallet Addresses</label>
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
              disabled={addresses.length >= 20}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
            <Button onClick={handleBatchCheck} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check All Wallets'
              )}
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Checked</p>
                <p className="text-2xl font-bold mt-1">{results.summary.totalChecked}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">Successful</p>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                  {results.summary.successful}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300">Failed</p>
                <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
                  {results.summary.failed}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold mt-1">
                  {results.summary.averageScore.toFixed(0)}
                </p>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.results.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg",
                    result.error && "bg-red-50/50 dark:bg-red-950/10"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {result.error ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-mono text-sm">{formatAddress(result.address)}</span>
                    </div>
                    {result.error ? (
                      <p className="text-sm text-red-600">{result.error}</p>
                    ) : (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Score: {result.overallScore}</span>
                        <span>{result.airdropCount} airdrops</span>
                        <span>{formatCurrency(result.totalValue)}</span>
                      </div>
                    )}
                  </div>
                  {!result.error && (
                    <div className="text-right ml-4">
                      <Badge variant="secondary">
                        {result.topAirdrop.projectId}: {result.topAirdrop.score}%
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';

