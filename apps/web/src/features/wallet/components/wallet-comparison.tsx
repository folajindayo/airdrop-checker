'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, X, Trophy, TrendingUp } from 'lucide-react';
import { isAddress } from 'viem';

interface WalletComparisonData {
  address: string;
  overallScore: number;
  totalAirdrops: number;
  highScoreAirdrops: number;
  averageScore: number;
}

export function WalletComparison() {
  const [addresses, setAddresses] = useState<string[]>(['', '']);
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<WalletComparisonData[] | null>(null);
  const [winner, setWinner] = useState<{ address: string; value: number } | null>(
    null
  );

  const addAddressField = () => {
    if (addresses.length < 5) {
      setAddresses([...addresses, '']);
    } else {
      toast.error('Maximum 5 wallets allowed for comparison');
    }
  };

  const removeAddressField = (index: number) => {
    if (addresses.length > 2) {
      setAddresses(addresses.filter((_, i) => i !== index));
    }
  };

  const updateAddress = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  const handleCompare = async () => {
    // Validate addresses
    const filledAddresses = addresses.filter((addr) => addr.trim() !== '');

    if (filledAddresses.length < 2) {
      toast.error('Please enter at least 2 wallet addresses');
      return;
    }

    const invalidAddresses = filledAddresses.filter((addr) => !isAddress(addr));

    if (invalidAddresses.length > 0) {
      toast.error('Invalid wallet address format detected');
      return;
    }

    setIsComparing(true);
    setResults(null);
    setWinner(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: filledAddresses }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Comparison failed');
      }

      const data = await response.json();
      setResults(data.wallets);
      setWinner(data.winner);
      toast.success('Comparison completed successfully!');
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to compare wallets'
      );
    } finally {
      setIsComparing(false);
    }
  };

  const resetComparison = () => {
    setAddresses(['', '']);
    setResults(null);
    setWinner(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wallet Comparison</CardTitle>
        <CardDescription>
          Compare airdrop eligibility across multiple wallets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`address-${index}`} className="sr-only">
                    Wallet Address {index + 1}
                  </Label>
                  <Input
                    id={`address-${index}`}
                    placeholder={`Wallet Address ${index + 1}`}
                    value={address}
                    onChange={(e) => updateAddress(index, e.target.value)}
                    disabled={isComparing}
                  />
                </div>
                {addresses.length > 2 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeAddressField(index)}
                    disabled={isComparing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={addAddressField}
                disabled={isComparing || addresses.length >= 5}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Wallet {addresses.length < 5 && `(${addresses.length}/5)`}
              </Button>

              <Button
                onClick={handleCompare}
                disabled={isComparing}
                className="flex-1"
              >
                {isComparing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Compare Wallets
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Winner Announcement */}
            {winner && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-900">
                    Highest Score Winner
                  </h3>
                </div>
                <p className="text-sm text-yellow-800 font-mono">
                  {winner.address}
                </p>
                <p className="text-2xl font-bold text-yellow-900 mt-2">
                  {winner.value}/100
                </p>
              </div>
            )}

            {/* Comparison Table */}
            <div className="space-y-2">
              {results.map((wallet, index) => (
                <div
                  key={wallet.address}
                  className={`p-4 rounded-lg border ${
                    wallet.address === winner?.address
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Wallet {index + 1}
                    </span>
                    {wallet.address === winner?.address && (
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mb-3">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Overall Score
                      </p>
                      <p className="text-xl font-bold">
                        {wallet.overallScore}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        High Score Airdrops
                      </p>
                      <p className="text-xl font-bold">
                        {wallet.highScoreAirdrops}/{wallet.totalAirdrops}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={resetComparison} className="w-full">
              New Comparison
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

