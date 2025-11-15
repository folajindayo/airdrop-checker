'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  status?: 'completed' | 'in-progress' | 'pending' | 'error' | 'cancelled';
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function Timeline({
  items,
  variant = 'default',
  className,
}: TimelineProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {item.icon || getStatusIcon(item.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(item.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

      {/* Timeline items */}
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="relative flex gap-4">
            {/* Icon */}
            <div className="relative z-10 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-background border-2 border-border flex items-center justify-center">
                {item.icon || getStatusIcon(item.status)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              {variant === 'detailed' ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{item.title}</h4>
                        {item.status && (
                          <Badge
                            variant={
                              item.status === 'completed'
                                ? 'default'
                                : item.status === 'error'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {item.status}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.timestamp)}
                      </p>
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="pt-2 border-t">
                          <dl className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(item.metadata).map(([key, value]) => (
                              <div key={key}>
                                <dt className="text-muted-foreground">{key}:</dt>
                                <dd className="font-medium">{String(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    {item.status && (
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          getStatusColor(item.status)
                        )}
                      />
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal timeline
export function HorizontalTimeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      {/* Horizontal line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />

      {/* Timeline items */}
      <div className="flex justify-between">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative flex flex-col items-center min-w-0"
          >
            {/* Icon */}
            <div className="relative z-10 h-10 w-10 rounded-full bg-background border-2 border-border flex items-center justify-center">
              {item.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.timestamp.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Activity feed timeline
export function ActivityFeed({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {item.icon || <Circle className="h-4 w-4 text-primary" />}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm">{item.title}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {item.timestamp.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Airdrop timeline
export function AirdropTimeline({
  events,
  className,
}: {
  events: Array<{
    id: string;
    type: 'announcement' | 'snapshot' | 'distribution' | 'claim';
    project: string;
    date: Date;
    completed?: boolean;
  }>;
  className?: string;
}) {
  const getEventIcon = (type: string) => {
    // You can customize icons per event type
    return <Circle className="h-5 w-5" />;
  };

  const timelineItems: TimelineItem[] = events.map((event) => ({
    id: event.id,
    title: `${event.project} - ${event.type}`,
    timestamp: event.date,
    status: event.completed ? 'completed' : 'pending',
    icon: getEventIcon(event.type),
  }));

  return <Timeline items={timelineItems} variant="detailed" className={className} />;
}

