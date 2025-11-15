/**
 * Protocol Insights Overview Component
 * Extracted from main protocol-insights.tsx
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { VelocityMetrics, DecayMetrics, CoverageMetrics } from './protocol-insights.types';

interface ProtocolInsightsOverviewProps {
  velocity: VelocityMetrics;
  decay: DecayMetrics;
  coverage: CoverageMetrics;
}

export function ProtocolInsightsOverview({
  velocity,
  decay,
  coverage,
}: ProtocolInsightsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{velocity.currentAvgDaily.toFixed(1)}</div>
          <p className="text-sm text-muted-foreground">
            interactions/day ({velocity.percentChange > 0 ? '+' : ''}
            {velocity.percentChange.toFixed(0)}%)
          </p>
          <Badge variant={velocity.trend === 'accelerating' ? 'default' : 'secondary'}>
            {velocity.trend}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decay Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{decay.status}</div>
          {decay.daysSinceInteraction !== null && (
            <p className="text-sm text-muted-foreground">
              {decay.daysSinceInteraction} days since last interaction
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{coverage.score}%</div>
          <p className="text-sm text-muted-foreground">
            {coverage.coveredCategories.length} of {coverage.totalCategories} categories
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


