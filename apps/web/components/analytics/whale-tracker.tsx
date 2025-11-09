'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  Wallet,
  DollarSign,
  Activity,
  AlertCircle,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface WhaleTransaction {
  id: string;
  whaleAddress: string;
  type: 'buy' | 'sell' | 'transfer' | 'stake';
  token: string;
  amount: number;
  usdValue: number;
  timestamp: number;
  txHash: string;
  chain: string;
}

interface TrackedWhale {
  address: string;
  label: string;
  totalValue: number;
  lastActivity: number;
  followedSince: number;
  transactions: WhaleTransaction[];
}

interface WhaleTrackerProps {
  className?: string;
}

/**
 * WhaleTracker - Track and monitor large wallet movements
 * Follow whale wallets and get insights into their trading patterns
 */
export function WhaleTracker({ className = '' }: WhaleTrackerProps) {
  const [whales, setWhales] = useState<TrackedWhale[]>([]);
  const [recentActivity, setRecentActivity] = useState<WhaleTransaction[]>([]);
  const [isAddingWhale, setIsAddingWhale] = useState(false);
  const [newWhaleAddress, setNewWhaleAddress] = useState('');
  const [newWhaleLabel, setNewWhaleLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load whales from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('trackedWhales');
    if (stored) {
      try {
        setWhales(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load whales:', e);
      }
    }
  }, []);

  // Save whales to localStorage
  useEffect(() => {
    if (whales.length > 0) {
      localStorage.setItem('trackedWhales', JSON.stringify(whales));
    }
  }, [whales]);

  // Simulate whale activity updates
  useEffect(() => {
    const generateMockActivity = () => {
      const tokens = ['ETH', 'USDC', 'WBTC', 'LINK', 'UNI', 'AAVE'];
      const types: ('buy' | 'sell' | 'transfer' | 'stake')[] = [
        'buy',
        'sell',
        'transfer',
        'stake',
      ];
      const chains = ['Ethereum', 'Arbitrum', 'Base', 'Optimism'];

      const activity: WhaleTransaction[] = whales.flatMap((whale) => {
        // Generate 1-3 transactions per whale
        const txCount = Math.floor(Math.random() * 3) + 1;
        return Array.from({ length: txCount }, (_, i) => ({
          id: `${whale.address}-${Date.now()}-${i}`,
          whaleAddress: whale.address,
          type: types[Math.floor(Math.random() * types.length)],
          token: tokens[Math.floor(Math.random() * tokens.length)],
          amount: Math.floor(Math.random() * 10000) + 1000,
          usdValue: Math.floor(Math.random() * 1000000) + 100000,
          timestamp: Date.now() - Math.random() * 3600000,
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          chain: chains[Math.floor(Math.random() * chains.length)],
        }));
      });

      setRecentActivity(
        activity.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
      );
    };

    if (whales.length > 0) {
      generateMockActivity();
      const interval = setInterval(generateMockActivity, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [whales]);

  const addWhale = () => {
    if (!newWhaleAddress) return;

    const whale: TrackedWhale = {
      address: newWhaleAddress,
      label: newWhaleLabel || `Whale ${whales.length + 1}`,
      totalValue: Math.floor(Math.random() * 10000000) + 1000000,
      lastActivity: Date.now(),
      followedSince: Date.now(),
      transactions: [],
    };

    setWhales((prev) => [...prev, whale]);
    setNewWhaleAddress('');
    setNewWhaleLabel('');
    setIsAddingWhale(false);
  };

  const removeWhale = (address: string) => {
    setWhales((prev) => prev.filter((w) => w.address !== address));
    setRecentActivity((prev) => prev.filter((tx) => tx.whaleAddress !== address));
  };

  const refreshActivity = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getTxTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'sell':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'transfer':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'stake':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTxTypeIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="w-3 h-3" />;
      case 'sell':
        return <TrendingDown className="w-3 h-3" />;
      case 'transfer':
        return <ExternalLink className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Whale Tracker
            </h3>
            <p className="text-sm text-muted-foreground">
              Monitor large wallet movements and trading patterns
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshActivity}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setIsAddingWhale(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Track Whale
            </Button>
          </div>
        </div>

        {/* Tracked Whales */}
        {whales.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Tracked Whales ({whales.length})
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {whales.map((whale) => (
                <div
                  key={whale.address}
                  className="border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-full h-full flex items-center justify-center text-white font-bold">
                          {whale.label[0].toUpperCase()}
                        </div>
                      </Avatar>
                      <div>
                        <div className="font-medium">{whale.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {truncateAddress(whale.address)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWhale(whale.address)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Total Value</div>
                      <div className="font-semibold">
                        ${(whale.totalValue / 1e6).toFixed(2)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Last Active</div>
                      <div className="font-semibold">
                        {formatTimeAgo(whale.lastActivity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Whale Activity
            </h4>
            <div className="space-y-2">
              {recentActivity.map((tx) => {
                const whale = whales.find((w) => w.address === tx.whaleAddress);
                return (
                  <div
                    key={tx.id}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-8 h-8">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {whale?.label[0].toUpperCase() || 'W'}
                          </div>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{whale?.label}</span>
                            <Badge variant="secondary" className={getTxTypeColor(tx.type)}>
                              {getTxTypeIcon(tx.type)}
                              {tx.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {tx.chain}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.amount.toLocaleString()} {tx.token} (
                            <span className="text-foreground font-medium">
                              ${(tx.usdValue / 1e3).toFixed(1)}K
                            </span>
                            )
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(tx.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <a
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View TX <ExternalLink className="w-3 h-3" />
                      </a>
                      {tx.usdValue > 500000 && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Large Movement
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {whales.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <EyeOff className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h4 className="font-medium mb-1">No Whales Tracked</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Start tracking whale wallets to monitor their activity
            </p>
            <Button onClick={() => setIsAddingWhale(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Track Your First Whale
            </Button>
          </div>
        )}

        {/* Add Whale Dialog */}
        {isAddingWhale && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Track Whale Wallet</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Wallet Address
                  </label>
                  <Input
                    placeholder="0x..."
                    value={newWhaleAddress}
                    onChange={(e) => setNewWhaleAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Label (optional)
                  </label>
                  <Input
                    placeholder="e.g., Vitalik, Big Player, etc."
                    value={newWhaleLabel}
                    onChange={(e) => setNewWhaleLabel(e.target.value)}
                  />
                </div>
                <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
                  <p>💡 You&apos;ll receive notifications when this wallet makes large movements</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addWhale} className="flex-1">
                    Track Wallet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingWhale(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Whale Tracking Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Follow wallets of successful traders and institutions</li>
            <li>• Track movements larger than $500K for significant signals</li>
            <li>• Be cautious of wash trading and manipulation tactics</li>
            <li>• Use whale activity as one signal among many - not financial advice</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

