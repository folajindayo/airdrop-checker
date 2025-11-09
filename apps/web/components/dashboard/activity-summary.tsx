'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Link2, Coins, Image } from 'lucide-react';

interface ActivitySummaryProps {
  totalTransactions: number;
  chainsUsed: string[];
  protocolsInteracted: string[];
  nftsOwned: number;
}

export function ActivitySummary({
  totalTransactions,
  chainsUsed,
  protocolsInteracted,
  nftsOwned,
}: ActivitySummaryProps) {
  const stats = [
    {
      title: 'Total Transactions',
      value: totalTransactions.toLocaleString(),
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Chains Active',
      value: chainsUsed.length,
      icon: Link2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Protocols Used',
      value: protocolsInteracted.length,
      icon: Coins,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'NFTs Owned',
      value: nftsOwned.toLocaleString(),
      icon: Image,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Activity Summary</CardTitle>
        <CardDescription>
          Overview of your on-chain activity across all networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {chainsUsed.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Active Chains</h4>
            <div className="flex flex-wrap gap-2">
              {chainsUsed.map((chain) => (
                <span
                  key={chain}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                >
                  {chain}
                </span>
              ))}
            </div>
          </div>
        )}

        {protocolsInteracted.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3">
              Top Protocols ({protocolsInteracted.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {protocolsInteracted.slice(0, 10).map((protocol) => (
                <span
                  key={protocol}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                >
                  {protocol}
                </span>
              ))}
              {protocolsInteracted.length > 10 && (
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                  +{protocolsInteracted.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

