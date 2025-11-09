'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { StatusBadge } from '@/components/common/status-badge';
import { Separator } from '@/components/ui/separator';

interface SnapshotHighlight {
  projectId: string;
  name: string;
  status: string;
  snapshotDate: string;
  daysUntilSnapshot: number;
}

interface ValueHighlight {
  projectId: string;
  name: string;
  status: string;
  estimatedValue: string;
  estimatedValueUSD: number;
}

interface ActivityHighlight {
  projectId: string;
  name: string;
  status: string;
  updatedAt?: string;
  hoursSinceUpdate: number | null;
}

interface HighlightsResponse {
  highlights: {
    upcomingSnapshots: SnapshotHighlight[];
    highestValue: ValueHighlight[];
    recentlyUpdated: ActivityHighlight[];
    generatedAt: string;
  };
  cached?: boolean;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

function formatRelativeHours(hours: number | null): string {
  if (hours === null) return 'Unknown';
  if (hours <= 1) return 'Updated <1h ago';
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.round(hours / 24);
  return `Updated ${days}d ago`;
}

function formatDaysUntil(days: number): string {
  if (days <= 0) return 'Today';
  if (days <= 1) return 'Tomorrow';
  return `${Math.ceil(days)} days`;
}

function formatUSD(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function AirdropHighlights() {
  const [state, setState] = useState<FetchState>('idle');
  const [data, setData] = useState<HighlightsResponse['highlights'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHighlights() {
      try {
        setState('loading');
        const response = await fetch('/api/airdrops/highlights');
        const json = (await response.json()) as HighlightsResponse;

        if (!response.ok) {
          throw new Error((json as any)?.error || 'Failed to fetch highlights');
        }

        if (isMounted) {
          setData(json.highlights);
          setState('success');
        }
      } catch (err) {
        console.error('Failed to load airdrop highlights', err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unexpected error loading highlights'
          );
          setState('error');
        }
      }
    }

    loadHighlights();
    const interval = setInterval(loadHighlights, 2 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (state === 'loading' || state === 'idle') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Radar Highlights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                {[...Array(3)].map((__, innerIdx) => (
                  <Skeleton key={innerIdx} className="h-3 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle>Radar Highlights</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          {error ?? 'Unable to load highlights at the moment.'}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Radar Highlights</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">
            Upcoming Snapshots
          </h3>
          <Separator className="my-3" />
          <div className="space-y-4">
            {data.upcomingSnapshots.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No confirmed snapshot dates yet. Check back soon.
              </p>
            )}
            {data.upcomingSnapshots.map((snapshot) => (
              <div key={snapshot.projectId} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{snapshot.name}</span>
                  <StatusBadge status={snapshot.status as any} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Snapshot in {formatDaysUntil(snapshot.daysUntilSnapshot)} ·{' '}
                  {new Date(snapshot.snapshotDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">
            Highest Estimated Value
          </h3>
          <Separator className="my-3" />
          <div className="space-y-4">
            {data.highestValue.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No value estimates available for tracked airdrops yet.
              </p>
            )}
            {data.highestValue.map((item) => (
              <div key={item.projectId} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{item.name}</span>
                  <StatusBadge status={item.status as any} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated value:{' '}
                  <span className="font-semibold text-foreground">
                    {item.estimatedValue}
                  </span>{' '}
                  ({formatUSD(item.estimatedValueUSD)})
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">
            Recently Updated Projects
          </h3>
          <Separator className="my-3" />
          <div className="space-y-4">
            {data.recentlyUpdated.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No recent project updates detected.
              </p>
            )}
            {data.recentlyUpdated.map((item) => (
              <div key={item.projectId} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{item.name}</span>
                  <StatusBadge status={item.status as any} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeHours(item.hoursSinceUpdate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

