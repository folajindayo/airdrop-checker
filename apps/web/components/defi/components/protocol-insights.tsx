'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Target } from 'lucide-react';

interface ProtocolInsight {
  name: string;
  category: 'DeFi' | 'NFT' | 'Gaming' | 'Social' | 'Infrastructure';
  interactionCount: number;
  lastInteraction?: Date;
  airdropPotential: 'High' | 'Medium' | 'Low';
}

interface ProtocolInsightsProps {
  protocols: ProtocolInsight[];
  className?: string;
}

export function ProtocolInsights({ protocols, className }: ProtocolInsightsProps) {
  const getCategoryColor = (category: ProtocolInsight['category']) => {
    switch (category) {
      case 'DeFi':
        return 'bg-blue-100 text-blue-800';
      case 'NFT':
        return 'bg-purple-100 text-purple-800';
      case 'Gaming':
        return 'bg-green-100 text-green-800';
      case 'Social':
        return 'bg-pink-100 text-pink-800';
      case 'Infrastructure':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPotentialColor = (potential: ProtocolInsight['airdropPotential']) => {
    switch (potential) {
      case 'High':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-gray-400';
    }
  };

  const sortedProtocols = [...protocols].sort(
    (a, b) => b.interactionCount - a.interactionCount
  );

  const highPotentialCount = protocols.filter(
    (p) => p.airdropPotential === 'High'
  ).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Protocol Insights</CardTitle>
            <CardDescription>
              Protocols you've interacted with and their airdrop potential
            </CardDescription>
          </div>
          {highPotentialCount > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              {highPotentialCount} High Potential
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {protocols.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No protocol interactions detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedProtocols.map((protocol, index) => (
              <div
                key={`${protocol.name}-${index}`}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{protocol.name}</h4>
                    <Badge
                      variant="secondary"
                      className={getCategoryColor(protocol.category)}
                    >
                      {protocol.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {protocol.interactionCount} interaction
                      {protocol.interactionCount !== 1 ? 's' : ''}
                    </span>
                    {protocol.lastInteraction && (
                      <span>
                        Last:{' '}
                        {protocol.lastInteraction.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Airdrop Potential
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getPotentialColor(
                          protocol.airdropPotential
                        )}`}
                      />
                      <span className="text-sm font-medium">
                        {protocol.airdropPotential}
                      </span>
                    </div>
                  </div>
                  {protocol.airdropPotential === 'High' && (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {protocols.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-primary hover:underline">
              View all {protocols.length} protocols →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to map known protocols
export const KNOWN_PROTOCOLS: Record<
  string,
  Omit<ProtocolInsight, 'interactionCount' | 'lastInteraction'>
> = {
  // DeFi
  uniswap: { name: 'Uniswap', category: 'DeFi', airdropPotential: 'Medium' },
  aave: { name: 'Aave', category: 'DeFi', airdropPotential: 'Low' },
  compound: { name: 'Compound', category: 'DeFi', airdropPotential: 'Low' },
  curve: { name: 'Curve', category: 'DeFi', airdropPotential: 'Medium' },
  balancer: { name: 'Balancer', category: 'DeFi', airdropPotential: 'Medium' },

  // NFT
  zora: { name: 'Zora', category: 'NFT', airdropPotential: 'High' },
  opensea: { name: 'OpenSea', category: 'NFT', airdropPotential: 'High' },
  blur: { name: 'Blur', category: 'NFT', airdropPotential: 'Medium' },

  // Infrastructure
  eigenlayer: { name: 'EigenLayer', category: 'Infrastructure', airdropPotential: 'High' },
  layerzero: { name: 'LayerZero', category: 'Infrastructure', airdropPotential: 'High' },
  scroll: { name: 'Scroll', category: 'Infrastructure', airdropPotential: 'High' },
  starknet: { name: 'Starknet', category: 'Infrastructure', airdropPotential: 'Medium' },

  // Social
  lens: { name: 'Lens Protocol', category: 'Social', airdropPotential: 'High' },
  farcaster: { name: 'Farcaster', category: 'Social', airdropPotential: 'High' },
};

