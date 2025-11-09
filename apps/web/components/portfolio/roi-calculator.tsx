'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { TrendingUp, DollarSign, Target, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ROICalculatorProps {
  address: string;
  airdrops: Array<{
    projectId: string;
    project: string;
    score: number;
  }>;
  gasSpentUSD: number;
}

interface ROIData {
  totalGasSpent: number;
  potentialAirdropValue: number;
  roi: number;
  breakEvenValue: number;
  topOpportunities: Array<{
    projectId: string;
    projectName: string;
    score: number;
    estimatedValue?: string;
    gasToQualify: number;
    potentialROI: number;
  }>;
}

export function ROICalculator({ address, airdrops, gasSpentUSD }: ROICalculatorProps) {
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchROI();
  }, [address, gasSpentUSD]);

  async function fetchROI() {
    setLoading(true);
    try {
      const response = await fetch('/api/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) throw new Error('Failed to fetch ROI data');

      const data = await response.json();
      setRoiData(data);
    } catch (error) {
      console.error('Error fetching ROI:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!roiData) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No ROI data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ROI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gas Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${roiData.totalGasSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Potential Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${roiData.potentialAirdropValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${roiData.roi > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {roiData.roi > 0 ? '+' : ''}{roiData.roi.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Break Even
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${roiData.breakEvenValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Top ROI Opportunities</CardTitle>
          <CardDescription>
            Airdrops ranked by potential return on investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roiData.topOpportunities.length > 0 ? (
              roiData.topOpportunities.map((opp) => (
                <div key={opp.projectId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{opp.projectName}</div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline">Score: {opp.score}%</Badge>
                      {opp.estimatedValue && (
                        <span>Est. Value: {opp.estimatedValue}</span>
                      )}
                      {opp.gasToQualify > 0 && (
                        <span>Gas to Qualify: ${opp.gasToQualify.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${opp.potentialROI > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {opp.potentialROI > 0 ? '+' : ''}{opp.potentialROI.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Potential ROI</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No ROI opportunities found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
