'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@/components/wallet/connect-button';
import { PortfolioTracker } from '@/components/portfolio/portfolio-tracker';
import { GasTracker } from '@/components/portfolio/gas-tracker';
import { ROICalculator } from '@/components/portfolio/roi-calculator';
import { AirdropClaimTracker } from '@/components/portfolio/airdrop-claim-tracker';
import { MultiWalletPortfolio } from '@/components/portfolio/multi-wallet-portfolio';
import { DeFiPositionsTracker } from '@/components/portfolio/defi-positions-tracker';
import { ProtocolHeatmap } from '@/components/portfolio/protocol-heatmap';
import { FarmingStrategyBuilder } from '@/components/portfolio/farming-strategy-builder';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { CheckResult } from '@airdrop-finder/shared';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PortfolioPage() {
  const { isConnected, address, isConnecting } = useWallet();
  const router = useRouter();
  const [airdropData, setAirdropData] = useState<CheckResult | null>(null);
  const [gasSpentUSD, setGasSpentUSD] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isConnecting, router]);

  useEffect(() => {
    if (address && isConnected) {
      fetchAirdropData();
      fetchGasData();
    }
  }, [address, isConnected]);

  async function fetchAirdropData() {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/airdrop-check/${address}`);
      if (response.ok) {
        const data = await response.json();
        setAirdropData(data);
      }
    } catch (error) {
      console.error('Error fetching airdrop data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGasData() {
    if (!address) return;

    try {
      const response = await fetch(`/api/gas-tracker/${address}`);
      if (response.ok) {
        const data = await response.json();
        setGasSpentUSD(data.totalGasSpentUSD || 0);
      }
    } catch (error) {
      console.error('Error fetching gas data:', error);
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
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Portfolio & Analytics</h1>
              <p className="text-muted-foreground">Track your portfolio, gas spending, and ROI</p>
            </div>
          </div>
          <ConnectButton />
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-8">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="gas">Gas</TabsTrigger>
              <TabsTrigger value="defi">DeFi</TabsTrigger>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              <TabsTrigger value="roi">ROI</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
              <TabsTrigger value="multi">Multi-Wallet</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-6">
              {address && <PortfolioTracker address={address} />}
            </TabsContent>

            <TabsContent value="gas" className="space-y-6">
              {address && <GasTracker address={address} />}
            </TabsContent>

            <TabsContent value="defi" className="space-y-6">
              {address && <DeFiPositionsTracker address={address} />}
            </TabsContent>

            <TabsContent value="heatmap" className="space-y-6">
              {address && <ProtocolHeatmap address={address} />}
            </TabsContent>

            <TabsContent value="roi" className="space-y-6">
              {address && airdropData && (
                <ROICalculator
                  address={address}
                  airdrops={airdropData.airdrops}
                  gasSpentUSD={gasSpentUSD}
                />
              )}
            </TabsContent>

            <TabsContent value="strategy" className="space-y-6">
              {address && airdropData && (
                <FarmingStrategyBuilder
                  address={address}
                  currentScores={Object.fromEntries(
                    airdropData.airdrops.map((a) => [a.projectId, a.score])
                  )}
                />
              )}
            </TabsContent>

            <TabsContent value="claims" className="space-y-6">
              {address && <AirdropClaimTracker address={address} />}
            </TabsContent>

            <TabsContent value="multi" className="space-y-6">
              <MultiWalletPortfolio />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
