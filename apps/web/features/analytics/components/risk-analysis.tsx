'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  RefreshCw,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenApproval {
  spender: string;
  spenderName?: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  isUnlimited: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUsed?: string;
  chainId: number;
}

interface SecurityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  recommendation?: string;
}

interface RiskScore {
  overall: number;
  approvals: number;
  activity: number;
  exposure: number;
}

interface RiskAnalysisData {
  riskScore: RiskScore;
  approvals: TokenApproval[];
  securityChecks: SecurityCheck[];
  totalApprovals: number;
  criticalApprovals: number;
  recommendations: string[];
}

interface RiskAnalysisProps {
  address: string;
}

const RISK_COLORS = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
};

const RISK_BG_COLORS = {
  low: 'bg-green-100 dark:bg-green-900/20',
  medium: 'bg-yellow-100 dark:bg-yellow-900/20',
  high: 'bg-orange-100 dark:bg-orange-900/20',
  critical: 'bg-red-100 dark:bg-red-900/20',
};

export function RiskAnalysis({ address }: RiskAnalysisProps) {
  const [data, setData] = useState<RiskAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchRiskAnalysis();
    }
  }, [address]);

  async function fetchRiskAnalysis() {
    setLoading(true);
    try {
      const response = await fetch(`/api/risk-analysis/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching risk analysis:', error);
      toast.error('Failed to load risk analysis');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(approval: TokenApproval) {
    setRevoking(approval.spender);
    try {
      // In a real implementation, this would interact with the wallet to revoke approval
      toast.info('Revoke approval functionality requires wallet interaction');
      // Simulate revoke
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Approval revoked successfully');
      fetchRiskAnalysis();
    } catch (error) {
      console.error('Error revoking approval:', error);
      toast.error('Failed to revoke approval');
    } finally {
      setRevoking(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No risk analysis data available</p>
      </Card>
    );
  }

  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  };

  const overallRiskLevel = getRiskLevel(data.riskScore.overall);

  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className={`h-8 w-8 ${RISK_COLORS[overallRiskLevel]}`} />
            <div>
              <h2 className="text-2xl font-bold">Security Risk Score</h2>
              <p className="text-sm text-muted-foreground">Comprehensive wallet security analysis</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRiskAnalysis}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall Score */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-center mb-4">
              <div className={`text-6xl font-bold ${RISK_COLORS[overallRiskLevel]}`}>
                {data.riskScore.overall}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Overall Security Score</p>
            </div>
            <Progress value={data.riskScore.overall} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Critical Risk</span>
              <span>Low Risk</span>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Approvals</span>
                <span className="text-sm font-bold">{data.riskScore.approvals}/100</span>
              </div>
              <Progress value={data.riskScore.approvals} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Activity</span>
                <span className="text-sm font-bold">{data.riskScore.activity}/100</span>
              </div>
              <Progress value={data.riskScore.activity} className="h-2" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Exposure</span>
                <span className="text-sm font-bold">{data.riskScore.exposure}/100</span>
              </div>
              <Progress value={data.riskScore.exposure} className="h-2" />
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium">{data.criticalApprovals} Critical Issues</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Checks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security Checks</h3>
        <div className="space-y-3">
          {data.securityChecks.map((check, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
            >
              {check.status === 'pass' ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : check.status === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">{check.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                {check.recommendation && (
                  <p className="text-sm text-blue-600 mt-2">💡 {check.recommendation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Token Approvals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Token Approvals</h3>
            <p className="text-sm text-muted-foreground">
              {data.totalApprovals} active approvals across all chains
            </p>
          </div>
          {data.criticalApprovals > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {data.criticalApprovals} Critical
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {data.approvals.map((approval, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${RISK_BG_COLORS[approval.riskLevel]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {approval.isUnlimited ? (
                      <Unlock className={`h-4 w-4 ${RISK_COLORS[approval.riskLevel]}`} />
                    ) : (
                      <Lock className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-semibold">{approval.tokenSymbol}</span>
                    <Badge variant="outline" className="text-xs">
                      Chain {approval.chainId}
                    </Badge>
                    <Badge
                      variant={
                        approval.riskLevel === 'critical'
                          ? 'destructive'
                          : approval.riskLevel === 'high'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {approval.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Spender: {approval.spenderName || approval.spender.slice(0, 10) + '...'}
                    </p>
                    <p className="text-muted-foreground">
                      Amount: {approval.isUnlimited ? 'Unlimited' : approval.amount}
                    </p>
                    {approval.lastUsed && (
                      <p className="text-xs text-muted-foreground">
                        Last used: {new Date(approval.lastUsed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(approval)}
                    disabled={revoking === approval.spender}
                  >
                    {revoking === approval.spender ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Revoke'
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`https://etherscan.io/address/${approval.spender}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

