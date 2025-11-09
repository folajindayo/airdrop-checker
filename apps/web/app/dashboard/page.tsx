'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@/components/wallet/connect-button';
import { ScoreGauge } from '@/components/dashboard/score-gauge';
import { AirdropCard } from '@/components/dashboard/airdrop-card';
import { TrendingAirdrops } from '@/components/dashboard/trending-airdrops';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/skeleton';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { CheckResult } from '@airdrop-finder/shared';
import Link from 'next/link';

export default function DashboardPage() {
  const { isConnected, address, isConnecting } = useWallet();
  const router = useRouter();
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isConnecting, router]);

  useEffect(() => {
    if (address && isConnected) {
      fetchEligibility();
    }
  }, [address, isConnected]);

  async function fetchEligibility() {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/airdrop-check/${address}`);
      const data = await response.json();
      
      if (!response.ok) {
        // Show detailed error message from API
        const errorMsg = data.message || data.error || 'Failed to fetch eligibility data';
        console.error('API Error:', data);
        toast.error(errorMsg, { duration: 5000 });
        return;
      }

      setResult(data);
      
      if (data.cached) {
        toast.info('Showing cached results');
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
      toast.error('Failed to load eligibility data. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    if (!address) return;

    setRefreshing(true);
    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(data.message || 'Rate limit exceeded. Please wait before refreshing again.');
          return;
        }
        throw new Error(data.error || 'Failed to refresh');
      }

      toast.success('Cache cleared. Refreshing data...');
      await fetchEligibility();
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  }

  if (isConnecting || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Airdrop Dashboard</h1>
              <p className="text-muted-foreground">Your eligibility overview</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <ConnectButton />
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        ) : result ? (
          <div className="space-y-10">
            {/* Score Section */}
            <div className="bg-card rounded-xl border p-8 shadow-lg">
              <ScoreGauge score={result.overallScore} />
            </div>

            {/* Trending */}
            <TrendingAirdrops limit={4} />

            {/* Airdrops Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Airdrop Eligibility</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.airdrops
                  .sort((a, b) => b.score - a.score)
                  .map((airdrop) => (
                    <AirdropCard key={airdrop.projectId} airdrop={airdrop} />
                  ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted/50 rounded-lg p-6 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Disclaimer</p>
              <p>
                This tool provides estimated eligibility based on publicly available blockchain
                data. Actual airdrop eligibility may vary and is subject to official criteria set
                by each project. Always verify eligibility through official channels.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

