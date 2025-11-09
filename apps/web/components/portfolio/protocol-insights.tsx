'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Flame, Gauge, LineChart, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusArea {
  category: string;
  categoryLabel: string;
  interactions: number;
  uniqueProtocols: number;
  score: number;
  status: 'strong' | 'needs_attention' | 'missing';
  recommendation: string;
}

interface CategoryScore {
  category: string;
  categoryLabel: string;
  score: number;
  interactions: number;
  uniqueProtocols: number;
  status: 'strong' | 'needs_attention' | 'missing';
}

interface TimelineEntry {
  id: string;
  txHash: string;
  date: string;
  protocol: string;
  category: string;
  categoryLabel: string;
  chainId: number;
  chainName: string;
  description: string;
}

interface ProtocolBreakdownEntry {
  protocol: string;
  category: string;
  categoryLabel: string;
  chainId: number;
  chainName: string;
  interactionCount: number;
  firstInteraction?: string;
  lastInteraction?: string;
  daysActive: number;
}

interface MonthlyActivity {
  month: string;
  interactionCount: number;
  uniqueProtocols: number;
}

type MomentumDirection = 'up' | 'steady' | 'down';
type VelocityTrend = 'accelerating' | 'steady' | 'cooling';
type DecayStatus = 'fresh' | 'warm' | 'stale';

interface VelocityMetrics {
  currentAvgDaily: number;
  previousAvgDaily: number;
  percentChange: number;
  deltaInteractions: number;
  trend: VelocityTrend;
}

interface DecayMetrics {
  daysSinceInteraction: number | null;
  status: DecayStatus;
}

interface MomentumMetrics {
  direction: MomentumDirection;
  percentChange: number;
  deltaInteractions: number;
}

interface StreakMetrics {
  activeDays: number;
  lastActiveDate?: string;
}

interface ProtocolInsights {
  summary: {
    totalProtocols: number;
    activeCategories: number;
    newProtocolsLast30d: number;
    avgInteractionsPerProtocol: number;
    engagementScore: number;
    momentum: MomentumMetrics;
    streak: StreakMetrics;
    velocity: VelocityMetrics;
    decay: DecayMetrics;
    lastInteraction?: string;
    mostActiveCategory?: {
      category: string;
      label: string;
      interactionCount: number;
    };
  };
  breakdown: ProtocolBreakdownEntry[];
  timeline: TimelineEntry[];
  focusAreas: FocusArea[];
  categoryScores: CategoryScore[];
  monthlyActivity: MonthlyActivity[];
  generatedAt: string;
}

interface ProtocolInsightsResponse {
  address: string;
  insights: ProtocolInsights;
  cached?: boolean;
}

interface ProtocolInsightsProps {
  address: string;
  className?: string;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

const STATUS_BADGE: Record<FocusArea['status'], string> = {
  strong: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100',
  needs_attention: 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100',
  missing: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
};

export function ProtocolInsightsPanel({ address, className = '' }: ProtocolInsightsProps) {
  const [state, setState] = useState<FetchState>('idle');
  const [data, setData] = useState<ProtocolInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    let isMounted = true;

    async function fetchInsights() {
      try {
        setState('loading');
        setError(null);

        const response = await fetch(`/api/protocol-insights/${address}`);
        const json = (await response.json()) as ProtocolInsightsResponse;

        if (!response.ok) {
          throw new Error((json as any)?.error || 'Failed to fetch protocol insights');
        }

        if (isMounted) {
          setData(json.insights);
          setState('success');
        }
      } catch (err) {
        console.error('Protocol insights fetch error', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unexpected error fetching insights');
          setState('error');
        }
      }
    }

    fetchInsights();
    const interval = setInterval(fetchInsights, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address]);

  const summaryCards = useMemo(() => {
    if (!data) return null;

    const cards = [
      {
        label: 'Engagement Score',
        value: data.summary.engagementScore,
        icon: Gauge,
      },
      {
        label: 'Protocols Touched',
        value: data.summary.totalProtocols,
        icon: Activity,
      },
      {
        label: 'Active Categories',
        value: data.summary.activeCategories,
        icon: Target,
      },
      {
        label: 'New in Last 30d',
        value: data.summary.newProtocolsLast30d,
        icon: Flame,
      },
      {
        label: 'Avg Interactions / Protocol',
        value: data.summary.avgInteractionsPerProtocol,
        icon: BarChart3,
      },
    ];

    return cards;
  }, [data]);

  const momentumSummary = useMemo(() => {
    if (!data) return null;
    const { momentum } = data.summary;

    const arrow =
      momentum.direction === 'up'
        ? '↑'
        : momentum.direction === 'down'
        ? '↓'
        : '→';

    const text =
      momentum.direction === 'steady'
        ? 'Activity steady compared to last month'
        : `Activity ${momentum.direction === 'up' ? 'up' : 'down'} ${
            momentum.percentChange
          }% (${momentum.deltaInteractions > 0 ? '+' : ''}${
            momentum.deltaInteractions
          } interactions)`;

    return {
      arrow,
      text,
      direction: momentum.direction,
    };
  }, [data]);

  const streakSummary = useMemo(() => {
    if (!data) return null;
    const { streak } = data.summary;

    if (streak.activeDays === 0) {
      return 'No recent activity streak detected';
    }

    const lastSeen = streak.lastActiveDate
      ? new Date(streak.lastActiveDate).toLocaleDateString()
      : null;

    return `Active ${streak.activeDays} day${
      streak.activeDays === 1 ? '' : 's'
    } in a row${lastSeen ? ` · Last interaction ${lastSeen}` : ''}`;
  }, [data]);

  const velocitySummary = useMemo(() => {
    if (!data) return null;
    const velocity = data.summary.velocity;
    const arrow =
      velocity.trend === 'accelerating'
        ? '↑'
        : velocity.trend === 'cooling'
        ? '↓'
        : '→';
    const color =
      velocity.trend === 'accelerating'
        ? 'text-emerald-600'
        : velocity.trend === 'cooling'
        ? 'text-rose-600'
        : 'text-muted-foreground';

    return {
      arrow,
      color,
      velocity,
    };
  }, [data]);

  const decaySummary = useMemo(() => {
    if (!data) return null;
    const decay = data.summary.decay;

    if (decay.daysSinceInteraction === null) {
      return {
        label: 'No recent activity',
        description: 'No onchain interactions recorded yet',
        status: decay.status,
      };
    }

    let label = 'Stale cadence';
    if (decay.status === 'fresh') {
      label = 'Fresh activity';
    } else if (decay.status === 'warm') {
      label = 'Active recently';
    }

    return {
      label,
      description: `${decay.daysSinceInteraction} day${
        decay.daysSinceInteraction === 1 ? '' : 's'
      } since last interaction`,
      status: decay.status,
    };
  }, [data]);

  if (state === 'loading' || state === 'idle') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Protocol Insights</CardTitle>
          <CardDescription>Loading your protocol activity map…</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (state === 'error' || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Protocol Insights</CardTitle>
          <CardDescription>We couldn’t pull your protocol insights right now.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error ?? 'Please try again in a few minutes.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Protocol Insights
        </CardTitle>
        <CardDescription>
          Deep dive into the protocols powering your airdrop eligibility footprint.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary cards */}
        {summaryCards && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {summaryCards.map((card, index) => (
              <div key={card.label + index} className="bg-muted/40 rounded-lg p-4 border">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{card.label}</span>
                  <card.icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-semibold mt-2">
                  {typeof card.value === 'number'
                    ? card.label === 'Engagement Score'
                      ? `${card.value.toLocaleString()}`
                      : card.value.toLocaleString()
                    : card.value}
                </p>
                {card.label === 'Engagement Score' && (
                  <div className="mt-3">
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(card.value as number, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Composite score across all protocol categories
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Most active highlight */}
        {data.summary.mostActiveCategory && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-primary font-semibold">
              Most Active Category · {data.summary.mostActiveCategory.label}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {data.summary.mostActiveCategory.interactionCount.toLocaleString()} interactions recorded recently.
            </p>
            {momentumSummary && (
              <p
                className={cn(
                  'text-xs mt-3 font-medium flex items-center gap-1',
                  momentumSummary.direction === 'up'
                    ? 'text-emerald-600'
                    : momentumSummary.direction === 'down'
                    ? 'text-rose-600'
                    : 'text-muted-foreground'
                )}
              >
                <span>{momentumSummary.arrow}</span>
                <span>{momentumSummary.text}</span>
              </p>
            )}
            {streakSummary && (
              <p className="text-xs text-muted-foreground mt-2">{streakSummary}</p>
            )}
          </div>
        )}

        <Tabs defaultValue="focus" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="focus">Focus Areas</TabsTrigger>
            <TabsTrigger value="breakdown">Protocol Breakdown</TabsTrigger>
            <TabsTrigger value="timeline">Interaction Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="space-y-4">
            {data.categoryScores?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Category Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.categoryScores.map((category) => (
                    <div key={category.category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{category.categoryLabel}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.interactions.toLocaleString()} interaction
                            {category.interactions === 1 ? '' : 's'} ·{' '}
                            {category.uniqueProtocols} protocol
                            {category.uniqueProtocols === 1 ? '' : 's'}
                          </p>
                        </div>
                        <span className="text-lg font-semibold text-foreground">
                          {category.score}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full mt-3">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all',
                            category.score >= 70 ? 'bg-emerald-500' : category.score >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                          )}
                          style={{ width: `${Math.min(category.score, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Status:{' '}
                        <span className="font-medium capitalize">
                          {category.status.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.focusAreas.map((area) => (
                <div key={area.category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{area.categoryLabel}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {area.interactions.toLocaleString()} interaction
                        {area.interactions === 1 ? '' : 's'} across{' '}
                        {area.uniqueProtocols} protocol
                        {area.uniqueProtocols === 1 ? '' : 's'}
                      </p>
                    </div>
                    <Badge className={cn('uppercase tracking-wide text-xs', STATUS_BADGE[area.status])}>
                      {area.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Engagement</span>
                      <span className="font-semibold text-foreground">{area.score}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all',
                          area.score >= 70 ? 'bg-emerald-500' : area.score >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                        )}
                        style={{ width: `${Math.min(area.score, 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {area.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {data.breakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No protocol interactions detected yet.
                </p>
              ) : (
                data.breakdown
                  .sort((a, b) => b.interactionCount - a.interactionCount)
                  .map((entry, idx) => (
                    <div key={`${entry.protocol}-${idx}`} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold capitalize">{entry.protocol}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <span>{entry.categoryLabel}</span>
                            <span>•</span>
                            <span>{entry.chainName}</span>
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {entry.interactionCount} tx
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground mt-3">
                        <div>
                          <p className="font-semibold text-foreground">{entry.daysActive}</p>
                          <p>days active</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {entry.firstInteraction
                              ? new Date(entry.firstInteraction).toLocaleDateString()
                              : '—'}
                          </p>
                          <p>first seen</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {entry.lastInteraction
                              ? new Date(entry.lastInteraction).toLocaleDateString()
                              : '—'}
                          </p>
                          <p>last seen</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {entry.interactionCount > 0
                              ? (entry.interactionCount / Math.max(entry.daysActive, 1)).toFixed(1)
                              : '0.0'}
                          </p>
                          <p>avg per day</p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {data.timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No onchain transactions recorded yet.
                </p>
              ) : (
                data.timeline.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{event.protocol}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <span>{event.categoryLabel}</span>
                          <span>•</span>
                          <span>{event.chainName}</span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Tx: <span className="font-mono">{event.txHash.slice(0, 10)}…</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {data.monthlyActivity.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">Monthly Activity</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.monthlyActivity.map((month) => (
                    <div key={month.month} className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {new Date(`${month.month}-01T00:00:00Z`).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{month.interactionCount} tx</span>
                        <span>{month.uniqueProtocols} protocols</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground">
          Insights refreshed at {new Date(data.generatedAt).toLocaleString()}.
        </p>
      </CardContent>
    </Card>
  );
}

