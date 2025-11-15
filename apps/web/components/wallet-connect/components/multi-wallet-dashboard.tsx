'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import {
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Crown,
  Award,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface WalletData {
  address: string;
  label?: string;
  overallScore: number;
  portfolioValue: number;
  riskScore: number;
  reputationScore: number;
  airdropCount: number;
  totalEstimatedAirdropValue: number;
  change24h: number;
}

interface ComparisonMetric {
  metric: string;
  [key: string]: string | number;
}

interface MultiWalletDashboardProps {
  initialAddress?: string;
}

export function MultiWalletDashboard({ initialAddress }: MultiWalletDashboardProps) {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [hideValues, setHideValues] = useState(false);

  useEffect(() => {
    if (initialAddress) {
      addWallet(initialAddress);
    }
  }, [initialAddress]);

  async function addWallet(address: string) {
    if (!address || wallets.some((w) => w.address.toLowerCase() === address.toLowerCase())) {
      toast.error('Wallet already added or invalid address');
      return;
    }

    if (wallets.length >= 5) {
      toast.error('Maximum 5 wallets allowed');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/wallet-summary/${address}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wallet data');
      }

      setWallets([...wallets, data]);
      setNewAddress('');
      toast.success('Wallet added successfully');
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast.error('Failed to add wallet');
    } finally {
      setLoading(false);
    }
  }

  function removeWallet(address: string) {
    setWallets(wallets.filter((w) => w.address !== address));
    toast.success('Wallet removed');
  }

  function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function formatValue(value: number): string {
    if (hideValues) return '****';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  if (wallets.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <Wallet className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Multi-Wallet Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              Add up to 5 wallets to compare and track
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Enter wallet address or ENS"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWallet(newAddress)}
              />
              <Button onClick={() => addWallet(newAddress)} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Prepare comparison data
  const comparisonData: ComparisonMetric[] = [
    {
      metric: 'Overall Score',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, w.overallScore])),
    },
    {
      metric: 'Portfolio Value',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, w.portfolioValue])),
    },
    {
      metric: 'Risk Score',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, w.riskScore])),
    },
    {
      metric: 'Reputation',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, w.reputationScore])),
    },
    {
      metric: 'Airdrop Count',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, w.airdropCount])),
    },
  ];

  // Radar chart data
  const radarData = [
    {
      metric: 'Score',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, w.overallScore])),
    },
    {
      metric: 'Risk',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, w.riskScore])),
    },
    {
      metric: 'Reputation',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, w.reputationScore])),
    },
    {
      metric: 'Airdrops',
      ...Object.fromEntries(wallets.map((w, i) => [`Wallet ${i + 1}`, (w.airdropCount / 20) * 100])),
    },
  ];

  // Find best performing wallet
  const bestWallet = wallets.reduce((best, current) =>
    current.overallScore > best.overallScore ? current : best
  );

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Multi-Wallet Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Tracking {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHideValues(!hideValues)}
            >
              {hideValues ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              {hideValues ? 'Show' : 'Hide'} Values
            </Button>
            {wallets.length < 5 && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add another wallet"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWallet(newAddress)}
                  className="w-48"
                />
                <Button onClick={() => addWallet(newAddress)} disabled={loading} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet, index) => (
          <Card key={wallet.address} className="p-6 relative">
            {wallet.address === bestWallet.address && (
              <div className="absolute top-2 right-2">
                <Crown className="h-5 w-5 text-yellow-500" />
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold">{wallet.label || `Wallet ${index + 1}`}</p>
                  <p className="text-xs text-muted-foreground">{formatAddress(wallet.address)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeWallet(wallet.address)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Score</span>
                <span className="text-lg font-bold">{wallet.overallScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Portfolio</span>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatValue(wallet.portfolioValue)}</p>
                  <p className={`text-xs ${wallet.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {wallet.change24h >= 0 ? '+' : ''}{wallet.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Airdrops</span>
                <Badge variant="secondary">{wallet.airdropCount} eligible</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Est. Value</span>
                <span className="text-sm font-semibold">{formatValue(wallet.totalEstimatedAirdropValue)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Score Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData.slice(0, 1)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="metric" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              {wallets.map((_, index) => (
                <Bar
                  key={index}
                  dataKey={`Wallet ${index + 1}`}
                  fill={colors[index]}
                  radius={[8, 8, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Multi-Metric Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
              {wallets.map((_, index) => (
                <Radar
                  key={index}
                  name={`Wallet ${index + 1}`}
                  dataKey={`Wallet ${index + 1}`}
                  stroke={colors[index]}
                  fill={colors[index]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Metric</th>
                {wallets.map((wallet, index) => (
                  <th key={wallet.address} className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <span>Wallet {index + 1}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {formatAddress(wallet.address)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Overall Score</td>
                {wallets.map((wallet) => (
                  <td key={wallet.address} className="text-center py-3 px-4">
                    <span className="font-semibold">{wallet.overallScore}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Portfolio Value</td>
                {wallets.map((wallet) => (
                  <td key={wallet.address} className="text-center py-3 px-4">
                    {formatValue(wallet.portfolioValue)}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">24h Change</td>
                {wallets.map((wallet) => (
                  <td key={wallet.address} className="text-center py-3 px-4">
                    <span className={wallet.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {wallet.change24h >= 0 ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
                      {wallet.change24h >= 0 ? '+' : ''}{wallet.change24h.toFixed(2)}%
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Risk Score</td>
                {wallets.map((wallet) => (
                  <td key={wallet.address} className="text-center py-3 px-4">
                    {wallet.riskScore}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Reputation Score</td>
                {wallets.map((wallet) => (
                  <td key={wallet.address} className="text-center py-3 px-4">
                    {wallet.reputationScore}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Eligible Airdrops</td>
                {wallets.map((wallet) => (
                  <td key={wallet.address} className="text-center py-3 px-4">
                    <Badge variant="secondary">{wallet.airdropCount}</Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Est. Airdrop Value</td>
                {wallets.map((wallet) => (
                  <td key={wallet.address} className="text-center py-3 px-4">
                    {formatValue(wallet.totalEstimatedAirdropValue)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Winner Card */}
      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <div className="flex items-center gap-4">
          <Award className="h-12 w-12 text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold mb-1">Top Performing Wallet</h3>
            <p className="text-sm text-muted-foreground">
              {formatAddress(bestWallet.address)} with an overall score of {bestWallet.overallScore}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

