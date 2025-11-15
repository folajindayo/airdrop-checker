'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Network,
  Users,
  Link as LinkIcon,
  TrendingUp,
  Eye,
  AlertTriangle,
  Activity,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

interface RelatedWallet {
  address: string;
  relationship: 'funding' | 'funded_by' | 'shared_activity' | 'similar_pattern' | 'cluster';
  confidence: number;
  commonTransactions: number;
  sharedProtocols: string[];
  firstInteraction: string;
  lastInteraction: string;
  totalValue: number;
}

interface WalletCluster {
  id: string;
  name: string;
  wallets: string[];
  totalValue: number;
  commonBehavior: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface ClusteringData {
  relatedWallets: RelatedWallet[];
  clusters: WalletCluster[];
  fundingTree: {
    source: string;
    target: string;
    amount: number;
    timestamp: string;
  }[];
  patterns: {
    pattern: string;
    frequency: number;
    wallets: string[];
  }[];
  stats: {
    totalRelated: number;
    clustersFound: number;
    avgConfidence: number;
    suspiciousActivity: number;
  };
}

interface WalletClusteringProps {
  address: string;
}

export function WalletClustering({ address }: WalletClusteringProps) {
  const [data, setData] = useState<ClusteringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchClusteringData();
    }
  }, [address]);

  async function fetchClusteringData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/wallet-clustering/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching clustering data:', error);
      toast.error('Failed to load wallet clustering data');
    } finally {
      setLoading(false);
    }
  }

  function getRelationshipColor(relationship: string) {
    switch (relationship) {
      case 'funding':
        return 'bg-green-600';
      case 'funded_by':
        return 'bg-blue-600';
      case 'shared_activity':
        return 'bg-purple-600';
      case 'similar_pattern':
        return 'bg-yellow-600';
      case 'cluster':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  }

  function getRiskColor(risk: string) {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-600/10';
      case 'medium':
        return 'text-yellow-600 bg-yellow-600/10';
      case 'high':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-gray-600 bg-gray-600/10';
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
        <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No clustering data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Related Wallets</p>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.stats.totalRelated}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Clusters Found</p>
            <Network className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.stats.clustersFound}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{data.stats.avgConfidence.toFixed(0)}%</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Suspicious</p>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{data.stats.suspiciousActivity}</p>
        </Card>
      </div>

      {/* Wallet Clusters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Identified Wallet Clusters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.clusters.map((cluster) => (
            <div
              key={cluster.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedCluster === cluster.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedCluster(cluster.id === selectedCluster ? null : cluster.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold mb-1">{cluster.name}</h4>
                  <Badge className={getRiskColor(cluster.riskLevel)}>
                    {cluster.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-lg font-bold">${(cluster.totalValue / 1000).toFixed(0)}k</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{cluster.wallets.length} wallets in cluster</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Common Behaviors:</p>
                  <div className="flex flex-wrap gap-1">
                    {cluster.commonBehavior.map((behavior, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {behavior}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {selectedCluster === cluster.id && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold mb-2">Cluster Wallets:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {cluster.wallets.map((wallet) => (
                      <div
                        key={wallet}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs font-mono"
                      >
                        <span>{wallet.slice(0, 20)}...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyAddress(wallet);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Related Wallets */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Related Wallets</h3>
        <div className="space-y-3">
          {data.relatedWallets.map((wallet) => (
            <div
              key={wallet.address}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-mono text-sm truncate">{wallet.address}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyAddress(wallet.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getRelationshipColor(wallet.relationship)}>
                      {wallet.relationship.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {wallet.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-lg font-bold">${wallet.totalValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Common Txs</p>
                  <p className="font-semibold">{wallet.commonTransactions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">First Interaction</p>
                  <p className="font-semibold">
                    {new Date(wallet.firstInteraction).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Last Interaction</p>
                  <p className="font-semibold">
                    {new Date(wallet.lastInteraction).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Shared Protocols</p>
                  <p className="font-semibold">{wallet.sharedProtocols.length}</p>
                </div>
              </div>
              {wallet.sharedProtocols.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Shared Protocols:</p>
                  <div className="flex flex-wrap gap-1">
                    {wallet.sharedProtocols.map((protocol) => (
                      <Badge key={protocol} variant="secondary" className="text-xs">
                        {protocol}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Behavior Patterns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Common Behavior Patterns</h3>
        <div className="space-y-3">
          {data.patterns.map((pattern, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{pattern.pattern}</p>
                    <p className="text-sm text-muted-foreground">
                      Observed {pattern.frequency} times
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  <Activity className="h-3 w-3 mr-1" />
                  {pattern.wallets.length} wallets
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Funding Tree */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Funding Relationships</h3>
        <div className="space-y-2">
          {data.fundingTree.slice(0, 10).map((funding, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs">{funding.source.slice(0, 16)}...</p>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="font-mono text-xs">{funding.target.slice(0, 16)}...</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(funding.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  ${funding.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <Network className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">About Wallet Clustering</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Wallet clustering uses advanced analytics to identify related wallets based on:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Direct funding relationships and transaction flows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Shared protocol interactions and similar behavior patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Temporal analysis of transaction timing and frequency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Common counterparties and interaction networks</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

