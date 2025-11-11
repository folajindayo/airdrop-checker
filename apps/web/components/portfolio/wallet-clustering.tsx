'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletClusteringProps {
  address: string;
  className?: string;
}

interface RelatedWallet {
  address: string;
  similarity: number;
  sharedContracts: number;
  sharedTokens: number;
  relationshipType: 'funding' | 'interaction' | 'token' | 'unknown';
  firstInteraction: string;
  lastInteraction: string;
}

interface ClusteringData {
  address: string;
  clusterSize: number;
  relatedWallets: RelatedWallet[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  timestamp: number;
}

export function WalletClustering({ address, className = '' }: WalletClusteringProps) {
  const [data, setData] = useState<ClusteringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchClustering() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/wallet-clustering/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch clustering data');
        }
        
        const clusteringData = await response.json();
        setData(clusteringData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchClustering();
  }, [address]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Wallet Clustering Detection</CardTitle>
          <CardDescription>Error loading clustering data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'funding':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'interaction':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'token':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Wallet Clustering Detection
        </CardTitle>
        <CardDescription>Detect related wallets and potential clustering</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Cluster Size</p>
            <p className="text-2xl font-bold mt-1">{data.clusterSize}</p>
            <p className="text-xs text-muted-foreground mt-1">related wallets</p>
          </div>
          <div className={cn(
            "rounded-lg p-4",
            data.riskLevel === 'high' ? "bg-red-50 dark:bg-red-950/20" :
            data.riskLevel === 'medium' ? "bg-yellow-50 dark:bg-yellow-950/20" :
            "bg-green-50 dark:bg-green-950/20"
          )}>
            <p className="text-sm text-muted-foreground">Risk Level</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getRiskColor(data.riskLevel)}>
                {data.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Recommendations
                </h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  {data.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Related Wallets */}
        {data.relatedWallets.length > 0 ? (
          <div>
            <h3 className="font-semibold mb-3">Related Wallets</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.relatedWallets.map((wallet, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm">{formatAddress(wallet.address)}</span>
                      <Badge className={getRelationshipColor(wallet.relationshipType)}>
                        {wallet.relationshipType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{wallet.sharedContracts} shared contracts</span>
                      {wallet.sharedTokens > 0 && (
                        <span>{wallet.sharedTokens} shared tokens</span>
                      )}
                      <span>
                        {new Date(wallet.firstInteraction).toLocaleDateString()} - {new Date(wallet.lastInteraction).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">{wallet.similarity.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">similarity</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No related wallets detected</p>
            <p className="text-sm mt-1">Your wallet appears to be independent</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



