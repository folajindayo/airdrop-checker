'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: 'transaction' | 'milestone' | 'achievement';
  chain?: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'transaction':
        return <Calendar className="h-4 w-4" />;
      case 'milestone':
        return <TrendingUp className="h-4 w-4" />;
      case 'achievement':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'transaction':
        return 'bg-blue-500';
      case 'milestone':
        return 'bg-purple-500';
      case 'achievement':
        return 'bg-green-500';
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Recent on-chain activity and milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to display</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-border" />

            {sortedEvents.slice(0, 10).map((event, index) => (
              <div key={index} className="relative pl-8">
                {/* Event dot */}
                <div
                  className={cn(
                    'absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full',
                    getEventColor(event.type),
                    'text-white'
                  )}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* Event content */}
                <div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    {event.chain && (
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                        {event.chain}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {event.description}
                  </p>
                  <time className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </div>
            ))}

            {sortedEvents.length > 10 && (
              <div className="text-center pt-4">
                <button className="text-sm text-primary hover:underline">
                  View {sortedEvents.length - 10} more events →
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to generate timeline from wallet data
export function generateTimelineFromActivity(params: {
  totalTransactions: number;
  chainsUsed: string[];
  firstTransactionDate?: Date;
  lastTransactionDate?: Date;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const now = new Date();

  if (params.lastTransactionDate) {
    events.push({
      date: params.lastTransactionDate.toISOString(),
      title: 'Recent Transaction',
      description: 'Last on-chain activity detected',
      type: 'transaction',
    });
  }

  if (params.totalTransactions >= 100) {
    events.push({
      date: now.toISOString(),
      title: '100+ Transactions',
      description: `Reached ${params.totalTransactions} total transactions across all chains`,
      type: 'milestone',
    });
  }

  if (params.chainsUsed.length >= 3) {
    events.push({
      date: now.toISOString(),
      title: 'Multi-Chain User',
      description: `Active on ${params.chainsUsed.length} different blockchain networks`,
      type: 'achievement',
    });
  }

  if (params.firstTransactionDate) {
    const daysSinceFirst = Math.floor(
      (now.getTime() - params.firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceFirst >= 365) {
      events.push({
        date: params.firstTransactionDate.toISOString(),
        title: 'Veteran User',
        description: `First transaction over ${Math.floor(daysSinceFirst / 365)} year(s) ago`,
        type: 'achievement',
      });
    }
  }

  return events;
}

