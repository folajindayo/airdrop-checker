'use client';

import { WalletComparison } from '@/components/dashboard/wallet-comparison';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineAlert } from '@/components/ui/alert';
import { TrendingUp, Users, BarChart3 } from 'lucide-react';

export default function ComparePage() {
  return (
    <div className="container py-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Wallet Comparison</h1>
        <p className="text-muted-foreground">
          Compare airdrop eligibility across up to 5 wallet addresses
        </p>
      </div>

      {/* Info Alert */}
      <InlineAlert variant="info">
        <p>
          <strong>How it works:</strong> Enter 2-5 wallet addresses to see side-by-side
          comparison of their airdrop eligibility scores. The wallet with the highest
          overall score will be highlighted as the winner.
        </p>
      </InlineAlert>

      {/* Main Comparison Component */}
      <WalletComparison />

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base">Score Comparison</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Compare overall eligibility scores and see which wallet has the best airdrop
              potential across all tracked projects.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-base">Multi-Wallet Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Analyze up to 5 wallets simultaneously. Perfect for managing multiple addresses
              or comparing your wallet with others.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">High Score Tracking</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              See which wallet has the most high-score airdrops (≥70%) to identify your
              best opportunities for rewards.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-2">Tips for Comparison:</p>
              <ul className="space-y-1">
                <li>• Enter valid Ethereum addresses (0x...)</li>
                <li>• Addresses can be from different networks</li>
                <li>• Results show eligibility across all supported chains</li>
                <li>• Use this to decide which wallet to focus on</li>
                <li>• Winner is determined by overall eligibility score</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

