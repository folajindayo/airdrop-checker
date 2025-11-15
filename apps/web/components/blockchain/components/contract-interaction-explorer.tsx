'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  FileCode,
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Copy,
  Search,
  Code,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ContractInteraction {
  contract: string;
  name?: string;
  function: string;
  count: number;
  lastInteraction: string;
  gasSpent: number;
  chain: string;
  verified: boolean;
  risk: 'low' | 'medium' | 'high';
}

interface ContractDetails {
  address: string;
  name: string;
  verified: boolean;
  audited: boolean;
  deployDate: string;
  compiler: string;
  optimization: boolean;
  chain: string;
  creator: string;
  balance: number;
  txCount: number;
  uniqueUsers: number;
  risk: 'low' | 'medium' | 'high';
  riskFactors: string[];
}

interface FunctionCall {
  function: string;
  count: number;
  gasAvg: number;
  successRate: number;
}

interface ContractData {
  topContracts: ContractInteraction[];
  contractDetails: ContractDetails | null;
  functionCalls: FunctionCall[];
  interactionTimeline: { date: string; interactions: number }[];
  chainDistribution: { chain: string; count: number }[];
  riskDistribution: { risk: string; count: number }[];
}

interface ContractInteractionExplorerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function ContractInteractionExplorer({ address }: ContractInteractionExplorerProps) {
  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchContractData();
    }
  }, [address]);

  async function fetchContractData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/contract-interactions/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching contract data:', error);
      toast.error('Failed to load contract interactions');
    } finally {
      setLoading(false);
    }
  }

  async function selectContract(contractAddress: string) {
    setSelectedContract(contractAddress);
    try {
      const response = await fetch(`/api/contract-details/${contractAddress}`);
      const details = await response.json();
      setData((prev) => prev ? { ...prev, contractDetails: details } : null);
    } catch (error) {
      console.error('Error fetching contract details:', error);
      toast.error('Failed to load contract details');
    }
  }

  function getRiskColor(risk: string) {
    switch (risk) {
      case 'low':
        return 'bg-green-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'high':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  }

  function copyAddress(addr: string) {
    navigator.clipboard.writeText(addr);
    toast.success('Address copied to clipboard');
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
        <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No contract interaction data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Contracts</p>
            <FileCode className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.topContracts.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.topContracts.filter(c => c.verified).length} verified
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Interactions</p>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">
            {data.topContracts.reduce((sum, c) => sum + c.count, 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Gas Spent</p>
            <Code className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">
            ${data.topContracts.reduce((sum, c) => sum + c.gasSpent, 0).toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Risk Score</p>
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">
            {((data.riskDistribution.find(r => r.risk === 'low')?.count || 0) / data.topContracts.length * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Low risk</p>
        </Card>
      </div>

      {/* Interaction Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Interaction Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.interactionTimeline}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Line type="monotone" dataKey="interactions" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chain Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.chainDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ chain, count }) => `${chain}: ${count}`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
              >
                {data.chainDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="risk" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.riskDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.risk === 'low'
                        ? '#10b981'
                        : entry.risk === 'medium'
                        ? '#f59e0b'
                        : '#ef4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Contracts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Most Interacted Contracts</h3>
        <div className="space-y-3">
          {data.topContracts.map((contract, index) => (
            <div
              key={contract.contract}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              onClick={() => selectContract(contract.contract)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-sm truncate">{contract.contract}</p>
                    {contract.name && <Badge variant="secondary">{contract.name}</Badge>}
                    <Badge variant="outline">{contract.chain}</Badge>
                    {contract.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge className={getRiskColor(contract.risk)}>
                      {contract.risk.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Function: {contract.function}</span>
                    <span>Interactions: {contract.count}</span>
                    <span>Gas: ${contract.gasSpent.toFixed(2)}</span>
                    <span>Last: {new Date(contract.lastInteraction).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyAddress(contract.contract);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://etherscan.io/address/${contract.contract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Contract Details */}
      {data.contractDetails && (
        <Card className="p-6 border-2 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{data.contractDetails.name}</h3>
              <p className="text-sm font-mono text-muted-foreground">{data.contractDetails.address}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setData(prev => prev ? {...prev, contractDetails: null} : null)}>
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {data.contractDetails.verified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {data.contractDetails.audited && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Audited
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chain</span>
                <Badge variant="secondary">{data.contractDetails.chain}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deploy Date</span>
                <span className="text-sm font-medium">
                  {new Date(data.contractDetails.deployDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Compiler</span>
                <span className="text-sm font-medium">{data.contractDetails.compiler}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="text-sm font-medium">${data.contractDetails.balance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transactions</span>
                <span className="text-sm font-medium">{data.contractDetails.txCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unique Users</span>
                <span className="text-sm font-medium">{data.contractDetails.uniqueUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <Badge className={getRiskColor(data.contractDetails.risk)}>
                  {data.contractDetails.risk.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {data.contractDetails.riskFactors.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-2">Risk Factors</p>
                  <ul className="space-y-1 text-sm">
                    {data.contractDetails.riskFactors.map((factor, i) => (
                      <li key={i}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Function Calls */}
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Function Calls</h4>
            <div className="space-y-2">
              {data.functionCalls.map((func) => (
                <div key={func.function} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-mono text-sm">{func.function}()</p>
                    <p className="text-xs text-muted-foreground">
                      {func.count} calls · Avg gas: {func.gasAvg.toFixed(0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {func.successRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Success rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <FileCode className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Contract Interaction Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  {((data.topContracts.filter(c => c.verified).length / data.topContracts.length) * 100).toFixed(0)}% of contracts you interact with are verified
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>
                  {data.riskDistribution.find(r => r.risk === 'high')?.count || 0} high-risk contract interactions detected
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Activity className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  Most active on {data.chainDistribution.reduce((max, curr) => curr.count > max.count ? curr : max).chain}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

