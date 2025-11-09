'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCode, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractAnalyzerProps {
  address: string;
  className?: string;
}

interface ContractInteraction {
  contractAddress: string;
  contractName: string;
  chainId: number;
  chainName: string;
  interactionCount: number;
  firstInteraction: string;
  lastInteraction: string;
  totalValue: number;
  functionCalls: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high';
  verified: boolean;
}

interface ContractAnalysisData {
  address: string;
  totalContracts: number;
  interactions: ContractInteraction[];
  topContracts: ContractInteraction[];
  riskSummary: {
    low: number;
    medium: number;
    high: number;
  };
  recommendations: string[];
  timestamp: number;
}

export function ContractAnalyzer({ address, className = '' }: ContractAnalyzerProps) {
  const [data, setData] = useState<ContractAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchAnalysis() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/contract-analyzer/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch contract analysis');
        }
        
        const analysisData = await response.json();
        setData(analysisData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
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
          <CardTitle>Contract Interaction Analyzer</CardTitle>
          <CardDescription>Error loading analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Contract Interaction Analyzer
        </CardTitle>
        <CardDescription>Analyze your smart contract interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contracts">Top Contracts</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold mt-1">{data.totalContracts}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">Low Risk</p>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                  {data.riskSummary.low}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300">High Risk</p>
                <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
                  {data.riskSummary.high}
                </p>
              </div>
            </div>

            {data.recommendations.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
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
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4 mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.topContracts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No contract interactions found
                </p>
              ) : (
                data.topContracts.map((contract, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{contract.contractName}</span>
                        <Badge className={getRiskColor(contract.riskLevel)}>
                          {contract.riskLevel.toUpperCase()}
                        </Badge>
                        {contract.verified ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mb-2">
                        {formatAddress(contract.contractAddress)} • {contract.chainName}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{contract.interactionCount} interactions</span>
                        <span>{formatCurrency(contract.totalValue)}</span>
                        <span>
                          {new Date(contract.firstInteraction).toLocaleDateString()} - {new Date(contract.lastInteraction).toLocaleDateString()}
                        </span>
                      </div>
                      {Object.keys(contract.functionCalls).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(contract.functionCalls)
                            .slice(0, 3)
                            .map(([func, count]) => (
                              <Badge key={func} variant="outline" className="text-xs">
                                {func}({count})
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4 mt-4">
            <div className="space-y-2">
              {data.topContracts
                .filter((c) => c.riskLevel === 'high' || c.riskLevel === 'medium')
                .map((contract, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 border rounded-lg bg-yellow-50/50 dark:bg-yellow-950/10"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">{contract.contractName}</span>
                        <Badge className={getRiskColor(contract.riskLevel)}>
                          {contract.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatAddress(contract.contractAddress)} • {contract.chainName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.interactionCount} interactions • {formatCurrency(contract.totalValue)} value
                      </p>
                    </div>
                  </div>
                ))}
              {data.topContracts.filter((c) => c.riskLevel === 'high' || c.riskLevel === 'medium').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No high or medium risk contracts found
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

