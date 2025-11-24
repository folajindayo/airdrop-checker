'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Plus,
  X,
  TrendingUp,
  DollarSign,
  Activity,
  Award,
  Zap,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface WalletMetrics {
  address: string;
  label?: string;
  totalValue: number;
  nftCount: number;
  defiValue: number;
  transactionCount: number;
  gasSpent: number;
  airdropScore: number;
  activeChains: number;
  avgDailyTx: number;
}

interface ComparisonData {
  metric: string;
  [key: string]: string | number;
}

export function WalletComparisonTool() {
  const [wallets, setWallets] = useState<WalletMetrics[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [loading, setLoading] = useState(false);

  async function addWallet() {
    if (!newAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    if (wallets.length >= 5) {
      toast.error('Maximum 5 wallets can be compared');
      return;
    }

    if (wallets.some(w => w.address.toLowerCase() === newAddress.toLowerCase())) {
      toast.error('Wallet already added');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/wallet-metrics/${newAddress}`);
      const metrics = await response.json();
      setWallets([...wallets, { ...metrics, address: newAddress }]);
      setNewAddress('');
      toast.success('Wallet added successfully');
    } catch (error) {
      console.error('Error fetching wallet metrics:', error);
      toast.error('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  }

  function removeWallet(address: string) {
    setWallets(wallets.filter(w => w.address !== address));
  }

  function getRadarData() {
    if (wallets.length === 0) return [];

    const metrics = [
      { metric: 'Portfolio', key: 'totalValue', max: Math.max(...wallets.map(w => w.totalValue)) },
      { metric: 'NFTs', key: 'nftCount', max: Math.max(...wallets.map(w => w.nftCount)) },
      { metric: 'DeFi', key: 'defiValue', max: Math.max(...wallets.map(w => w.defiValue)) },
      { metric: 'Activity', key: 'transactionCount', max: Math.max(...wallets.map(w => w.transactionCount)) },
      { metric: 'Airdrop', key: 'airdropScore', max: 100 },
    ];

    return metrics.map(({ metric, key, max }) => {
      const dataPoint: any = { metric };
      wallets.forEach((wallet, index) => {
        const value = wallet[key as keyof WalletMetrics] as number;
        dataPoint[`wallet${index}`] = max > 0 ? (value / max) * 100 : 0;
      });
      return dataPoint;
    });
  }

  function getComparisonData(): ComparisonData[] {
    return [
      {
        metric: 'Total Value',
        ...Object.fromEntries(wallets.map((w, i) => [`wallet${i}`, w.totalValue])),
      },
      {
        metric: 'NFT Count',
        ...Object.fromEntries(wallets.map((w, i) => [`wallet${i}`, w.nftCount])),
      },
      {
        metric: 'DeFi Value',
        ...Object.fromEntries(wallets.map((w, i) => [`wallet${i}`, w.defiValue])),
      },
      {
        metric: 'Transactions',
        ...Object.fromEntries(wallets.map((w, i) => [`wallet${i}`, w.transactionCount])),
      },
      {
        metric: 'Gas Spent',
        ...Object.fromEntries(wallets.map((w, i) => [`wallet${i}`, w.gasSpent])),
      },
    ];
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Add Wallet Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add Wallets to Compare</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter wallet address or ENS..."
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addWallet()}
            disabled={loading || wallets.length >= 5}
          />
          <Button onClick={addWallet} disabled={loading || wallets.length >= 5}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {wallets.length}/5 wallets added
        </p>
      </Card>

      {wallets.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Wallets Added</h3>
          <p className="text-muted-foreground mb-6">
            Add wallet addresses above to start comparing
          </p>
        </Card>
      ) : (
        <>
          {/* Wallet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {wallets.map((wallet, index) => (
              <Card key={wallet.address} className="p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeWallet(wallet.address)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div
                  className="h-2 w-full rounded-full mb-3"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <p className="text-xs text-muted-foreground mb-1">Wallet {index + 1}</p>
                <p className="text-sm font-mono truncate mb-3">{wallet.address}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-semibold">${(wallet.totalValue / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-semibold">{wallet.airdropScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Chains</span>
                    <span className="font-semibold">{wallet.activeChains}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Radar Chart Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Overall Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={getRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                {wallets.map((wallet, index) => (
                  <Radar
                    key={wallet.address}
                    name={`Wallet ${index + 1}`}
                    dataKey={`wallet${index}`}
                    stroke={COLORS[index]}
                    fill={COLORS[index]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Detailed Metrics Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getComparisonData()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="metric" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                {wallets.map((wallet, index) => (
                  <Bar
                    key={wallet.address}
                    dataKey={`wallet${index}`}
                    fill={COLORS[index]}
                    name={`Wallet ${index + 1}`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Side by Side Comparison Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Side by Side Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Metric</th>
                    {wallets.map((wallet, index) => (
                      <th key={wallet.address} className="text-right p-3 text-sm font-semibold">
                        <div
                          className="inline-block h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        Wallet {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Total Value
                      </div>
                    </td>
                    {wallets.map((wallet) => (
                      <td key={wallet.address} className="text-right p-3 text-sm font-medium">
                        ${wallet.totalValue.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        NFT Count
                      </div>
                    </td>
                    {wallets.map((wallet) => (
                      <td key={wallet.address} className="text-right p-3 text-sm font-medium">
                        {wallet.nftCount}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        DeFi Value
                      </div>
                    </td>
                    {wallets.map((wallet) => (
                      <td key={wallet.address} className="text-right p-3 text-sm font-medium">
                        ${wallet.defiValue.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-600" />
                        Transactions
                      </div>
                    </td>
                    {wallets.map((wallet) => (
                      <td key={wallet.address} className="text-right p-3 text-sm font-medium">
                        {wallet.transactionCount}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        Gas Spent
                      </div>
                    </td>
                    {wallets.map((wallet) => (
                      <td key={wallet.address} className="text-right p-3 text-sm font-medium">
                        ${wallet.gasSpent.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-red-600" />
                        Airdrop Score
                      </div>
                    </td>
                    {wallets.map((wallet) => (
                      <td key={wallet.address} className="text-right p-3 text-sm font-medium">
                        <Badge
                          variant={
                            wallet.airdropScore >= 80
                              ? 'default'
                              : wallet.airdropScore >= 60
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {wallet.airdropScore}/100
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm">Active Chains</td>
                    {wallets.map((wallet) => (
                      <td key={wallet.address} className="text-right p-3 text-sm font-medium">
                        {wallet.activeChains}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-sm">Avg Daily Tx</td>
                    {wallets.map((wallet) => (
                      <td key={wallet.address} className="text-right p-3 text-sm font-medium">
                        {wallet.avgDailyTx.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Winner Analysis */}
          <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-start gap-4">
              <Award className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Top Performers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Highest Value</p>
                    <p className="font-semibold">
                      Wallet {wallets.indexOf(wallets.reduce((max, w) => w.totalValue > max.totalValue ? w : max)) + 1}
                      {' '}· ${wallets.reduce((max, w) => w.totalValue > max.totalValue ? w : max).totalValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Most Active</p>
                    <p className="font-semibold">
                      Wallet {wallets.indexOf(wallets.reduce((max, w) => w.transactionCount > max.transactionCount ? w : max)) + 1}
                      {' '}· {wallets.reduce((max, w) => w.transactionCount > max.transactionCount ? w : max).transactionCount} txs
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Best Airdrop Score</p>
                    <p className="font-semibold">
                      Wallet {wallets.indexOf(wallets.reduce((max, w) => w.airdropScore > max.airdropScore ? w : max)) + 1}
                      {' '}· {wallets.reduce((max, w) => w.airdropScore > max.airdropScore ? w : max).airdropScore}/100
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

