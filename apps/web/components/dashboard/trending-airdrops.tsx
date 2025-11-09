'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TrendingProjectSummary } from '@airdrop-finder/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/common/skeleton';
import { StatusBadge } from '@/components/common/status-badge';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingResponse {
  trending: TrendingProjectSummary[];
  cached?: boolean;
  generatedAt?: string;
}

interface TrendingAirdropsProps {
  limit?: number;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function TrendingAirdrops({ limit = 4 }: TrendingAirdropsProps) {
  const [state, setState] = useState<FetchState>('idle');
  const [data, setData] = useState<TrendingProjectSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTrending() {
      try {
        setState('loading');
        setError(null);

        const response = await fetch(`/api/airdrops/trending?limit=${limit}`);
        const json = (await response.json()) as TrendingResponse;

        if (!response.ok) {
          throw new Error(json?.error || 'Failed to fetch trending airdrops');
        }

        if (isMounted) {
          setData(json.trending);
          setState('success');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load trending airdrops', err);
        setError(err instanceof Error ? err.message : 'Unexpected error loading trending airdrops');
        setState('error');
      }
    }

    fetchTrending();

    const interval = setInterval(fetchTrending, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [limit]);

  const hasData = data.length > 0;

  const content = useMemo(() => {
    if (state === 'loading') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, index) => (
            <Card key={index} className="border-dashed">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (state === 'error') {
      return (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            {error ?? 'Unable to load trending projects right now.'}
          </CardContent>
        </Card>
      );
    }

    if (!hasData) {
      return (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No trending projects available yet. Check back soon as we ingest more activity.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.map((project) => (
          <Card key={project.projectId} className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge status={project.status} />
                    {project.chains.length > 0 && (
                      <span>{project.chains.slice(0, 2).join(', ')}{project.chains.length > 2 ? ' +' : ''}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  {project.trendingScore >= 60 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-amber-500" />
                  )}
                  <span className="text-lg font-semibold text-foreground">
                    {project.trendingScore}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress
                value={project.trendingScore}
                className={cn('h-2', project.trendingScore >= 70 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-amber-500')}
              />
              <div className="flex flex-wrap gap-2">
                {project.signals.slice(0, 4).map((signal, idx) => (
                  <Badge key={signal.type + idx} variant="secondary" className="text-xs">
                    {signal.label}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {project.estimatedValue && (
                  <div>
                    Estimated value:{' '}
                    <span className="text-foreground font-medium">{project.estimatedValue}</span>
                  </div>
                )}
                {project.snapshotDate && (
                  <div>
                    Snapshot:{' '}
                    <span className="text-foreground font-medium">
                      {new Date(project.snapshotDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {project.claimUrl && (
                  <div>
                    Claim link:{' '}
                    <a
                      href={project.claimUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [data, error, hasData, limit, state]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Trending Airdrops</h2>
          <p className="text-sm text-muted-foreground">
            Real-time signal-based ranking across the ecosystem.
          </p>
        </div>
      </div>
      {content}
    </section>
  );
}

