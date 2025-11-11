'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@/components/wallet/connect-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { ArrowLeft, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface ROIData {
  address: string;
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

export default function ROIPage() {
  const { isConnected, address, isConnecting } = useWallet();
  const router = useRouter();
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isConnecting, router]);

  useEffect(() => {
    if (address && isConnected) {
      fetchROI();
    }
  }, [address, isConnected]);

  async function fetchROI() {
    if (!address) return;

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

  if (isConnecting || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">ROI Calculator</h1>
              <p className="text-muted-foreground">Calculate your airdrop farming ROI</p>
            </div>
          </div>
          <ConnectButton />
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : roiData ? (
          <div className="space-y-6">
            {/* ROI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Gas Spent
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">
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
                  {roiData.topOpportunities.map((opp) => (
                    <div key={opp.projectId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{opp.projectName}</div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Score: {opp.score}%</span>
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
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ROI Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                  ROI Chart Visualization (Coming Soon)
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No ROI data available</p>
          </div>
        )}
      </div>
    </div>
  );
}



