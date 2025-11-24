'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { isAddress } from 'viem';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface WatchlistWallet {
  id: string;
  address: string;
  nickname: string;
  addedAt: Date;
  lastChecked?: Date;
  lastScore?: number;
}

const STORAGE_KEY = 'airdrop-watchlist';
const MAX_WALLETS = 10;

export function WalletWatchlist() {
  const [wallets, setWallets] = useState<WatchlistWallet[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Load watchlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: WatchlistWallet[] = JSON.parse(stored);
        // Convert date strings back to Date objects
        const withDates = parsed.map((w) => ({
          ...w,
          addedAt: new Date(w.addedAt),
          lastChecked: w.lastChecked ? new Date(w.lastChecked) : undefined,
        }));
        setWallets(withDates);
      }
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
  }, []);

  // Save watchlist to localStorage
  const saveWatchlist = (updatedWallets: WatchlistWallet[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWallets));
      setWallets(updatedWallets);
    } catch (error) {
      console.error('Failed to save watchlist:', error);
      toast.error('Failed to save watchlist');
    }
  };

  const addWallet = () => {
    if (!newAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    if (!isAddress(newAddress)) {
      toast.error('Invalid wallet address format');
      return;
    }

    // Check if already in watchlist
    if (wallets.some((w) => w.address.toLowerCase() === newAddress.toLowerCase())) {
      toast.error('This wallet is already in your watchlist');
      return;
    }

    if (wallets.length >= MAX_WALLETS) {
      toast.error(`Maximum ${MAX_WALLETS} wallets allowed in watchlist`);
      return;
    }

    const newWallet: WatchlistWallet = {
      id: `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: newAddress,
      nickname: newNickname.trim() || `Wallet ${wallets.length + 1}`,
      addedAt: new Date(),
    };

    const updated = [...wallets, newWallet];
    saveWatchlist(updated);
    setNewAddress('');
    setNewNickname('');
    toast.success('Wallet added to watchlist');
  };

  const removeWallet = (id: string) => {
    const updated = wallets.filter((w) => w.id !== id);
    saveWatchlist(updated);
    toast.success('Wallet removed from watchlist');
  };

  const updateWalletScore = (id: string, score: number) => {
    const updated = wallets.map((w) =>
      w.id === id
        ? { ...w, lastScore: score, lastChecked: new Date() }
        : w
    );
    saveWatchlist(updated);
  };

  const checkAllWallets = async () => {
    setIsAdding(true);
    toast.info('Checking all wallets...');

    try {
      for (const wallet of wallets) {
        try {
          const response = await fetch(`/api/airdrop-check/${wallet.address}`);
          if (response.ok) {
            const data = await response.json();
            updateWalletScore(wallet.id, data.overallScore);
          }
        } catch (error) {
          console.error(`Failed to check ${wallet.nickname}:`, error);
        }
        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.success('Watchlist updated!');
    } catch (error) {
      toast.error('Failed to update watchlist');
    } finally {
      setIsAdding(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Wallet Watchlist</CardTitle>
              <CardDescription>
                Track multiple wallets and their airdrop eligibility
              </CardDescription>
            </div>
            <Badge variant="outline">
              {wallets.length}/{MAX_WALLETS}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Wallet Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="wallet-address">Wallet Address</Label>
                <Input
                  id="wallet-address"
                  placeholder="0x..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  disabled={wallets.length >= MAX_WALLETS}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-nickname">Nickname (Optional)</Label>
                <Input
                  id="wallet-nickname"
                  placeholder="My Wallet"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  disabled={wallets.length >= MAX_WALLETS}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={addWallet}
                disabled={wallets.length >= MAX_WALLETS || !newAddress}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Watchlist
              </Button>
              {wallets.length > 0 && (
                <Button
                  onClick={checkAllWallets}
                  disabled={isAdding}
                  variant="outline"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Check All
                </Button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {wallets.length === 0 && (
            <div className="text-center py-8 border rounded-lg bg-muted/50">
              <Eye className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">No wallets in watchlist</p>
              <p className="text-sm text-muted-foreground">
                Add wallet addresses to track their airdrop eligibility
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Watchlist Items */}
      {wallets.length > 0 && (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Nickname and Address */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{wallet.nickname}</h3>
                      {wallet.lastScore !== undefined && (
                        <Badge
                          variant={
                            wallet.lastScore >= 70
                              ? 'default'
                              : wallet.lastScore >= 40
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {getScoreBadge(wallet.lastScore)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono mb-3 truncate">
                      {wallet.address}
                    </p>

                    {/* Score and Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      {wallet.lastScore !== undefined ? (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Score:</span>
                            <span
                              className={cn(
                                'font-bold',
                                getScoreColor(wallet.lastScore)
                              )}
                            >
                              {wallet.lastScore}
                            </span>
                          </div>
                          {wallet.lastChecked && (
                            <div className="text-muted-foreground">
                              Updated{' '}
                              {wallet.lastChecked.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          <span>Not checked yet</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard?address=${wallet.address}`}>
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWallet(wallet.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Box */}
      {wallets.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Watchlist Tips</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Click "Check All" to update scores for all wallets</li>
                  <li>• Scores are cached for 1 hour to avoid rate limits</li>
                  <li>• Click the external link icon to view full details</li>
                  <li>• Maximum {MAX_WALLETS} wallets can be tracked</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

