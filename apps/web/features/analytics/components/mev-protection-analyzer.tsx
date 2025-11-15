'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Shield,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Eye,
  Zap,
  Activity,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MEVAttack {
  txHash: string;
  type: 'sandwich' | 'frontrun' | 'backrun' | 'liquidation';
  timestamp: string;
  lossAmount: number;
  token: string;
  attacker: string;
  protected: boolean;
}

interface ProtectionStats {
  totalAttacks: number;
  blockedAttacks: number;
  totalLoss: number;
  savedAmount: number;
  protectionRate: number;
}

interface MEVData {
  stats: ProtectionStats;
  recentAttacks: MEVAttack[];
  attacksByType: { type: string; count: number; loss: number }[];
  timeline: { date: string; attacks: number; losses: number }[];
  topAttackers: { address: string; attacks: number; profit: number }[];
  recommendations: string[];
}

interface MEVProtectionAnalyzerProps {
  address: string;
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

export function MEVProtectionAnalyzer({ address }: MEVProtectionAnalyzerProps) {
  const [data, setData] = useState<MEVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [protectionEnabled, setProtectionEnabled] = useState(false);

  useEffect(() => {
    if (address) {
      fetchMEVData();
    }
  }, [address]);

  async function fetchMEVData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/mev-protection/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching MEV data:', error);
      toast.error('Failed to load MEV protection data');
    } finally {
      setLoading(false);
    }
  }

  function getAttackTypeColor(type: string) {
    switch (type) {
      case 'sandwich':
        return 'bg-red-600';
      case 'frontrun':
        return 'bg-orange-600';
      case 'backrun':
        return 'bg-yellow-600';
      case 'liquidation':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  }

  function toggleProtection() {
    setProtectionEnabled(!protectionEnabled);
    toast.success(
      protectionEnabled ? 'MEV protection disabled' : 'MEV protection enabled! 🛡️'
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No MEV data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Protection Status */}
      <Card className={`p-6 ${protectionEnabled ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${protectionEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                MEV Protection {protectionEnabled ? 'Enabled' : 'Disabled'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {protectionEnabled
                  ? 'Your transactions are protected from MEV attacks'
                  : 'Enable protection to safeguard your transactions'}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            variant={protectionEnabled ? 'outline' : 'default'}
            onClick={toggleProtection}
          >
            {protectionEnabled ? 'Disable' : 'Enable'} Protection
          </Button>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Attacks</p>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{data.stats.totalAttacks}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Blocked</p>
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{data.stats.blockedAttacks}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Loss</p>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            ${data.stats.totalLoss.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Saved</p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${data.stats.savedAmount.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Protection Rate</p>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {data.stats.protectionRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Attack Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">MEV Attack Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="attacks"
              stroke="#ef4444"
              strokeWidth={2}
              name="Attacks"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="losses"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Losses ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Attack Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Attacks by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.attacksByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, count }) => `${type}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.attacksByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Loss by Attack Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.attacksByType}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="type" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="loss" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Attacks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent MEV Attacks</h3>
        <div className="space-y-3">
          {data.recentAttacks.map((attack) => (
            <div
              key={attack.txHash}
              className={`p-4 border rounded-lg ${
                attack.protected ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {attack.protected ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getAttackTypeColor(attack.type)}>
                        {attack.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{attack.token}</Badge>
                      {attack.protected && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          PROTECTED
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                      Tx: {attack.txHash.slice(0, 20)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${attack.protected ? 'text-green-600' : 'text-red-600'}`}>
                    {attack.protected ? 'Saved' : 'Lost'} ${attack.lossAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(attack.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>Attacker: {attack.attacker.slice(0, 16)}...</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Attackers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top MEV Attackers</h3>
        <div className="space-y-3">
          {data.topAttackers.map((attacker, index) => (
            <div
              key={attacker.address}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 text-white font-bold">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-mono text-sm">{attacker.address.slice(0, 20)}...</p>
                  <p className="text-xs text-muted-foreground">{attacker.attacks} attacks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">
                  ${attacker.profit.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Profit</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Protection Recommendations</h3>
            <ul className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">What is MEV?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              MEV (Maximal Extractable Value) refers to the profit that can be extracted by
              reordering, including, or censoring transactions within blocks. Common MEV attacks
              include:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>
                  <strong>Sandwich Attacks:</strong> Attackers place trades before and after your
                  transaction to profit from price movement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>
                  <strong>Frontrunning:</strong> Copying your transaction with higher gas to
                  execute first
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>
                  <strong>Backrunning:</strong> Executing immediately after your transaction to
                  profit from price changes
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

