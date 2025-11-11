'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SnapshotTrackerProps {
  className?: string;
}

interface Snapshot {
  id: string;
  projectId: string;
  projectName: string;
  snapshotDate: string;
  claimDate?: string;
  status: 'upcoming' | 'completed' | 'claimable';
  description: string;
  estimatedValue?: number;
  chainIds: number[];
}

interface SnapshotsData {
  snapshots: Snapshot[];
  upcoming: Snapshot[];
  completed: Snapshot[];
  claimable: Snapshot[];
  timestamp: number;
}

export function SnapshotTracker({ className = '' }: SnapshotTrackerProps) {
  const [data, setData] = useState<SnapshotsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSnapshots() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/snapshots');
        if (!response.ok) {
          throw new Error('Failed to fetch snapshots');
        }
        
        const snapshotsData = await response.json();
        setData(snapshotsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSnapshots();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Snapshot Tracker</CardTitle>
          <CardDescription>Error loading snapshots</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysUntil = (date: string) => {
    const days = Math.ceil(
      (new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'claimable':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderSnapshot = (snapshot: Snapshot) => {
    const daysUntil = getDaysUntil(snapshot.snapshotDate);
    const isPast = daysUntil < 0;

    return (
      <div
        key={snapshot.id}
        className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{snapshot.projectName}</span>
            <Badge className={getStatusColor(snapshot.status)}>
              {snapshot.status.toUpperCase()}
            </Badge>
            {snapshot.estimatedValue && (
              <Badge variant="secondary">
                Est: {formatCurrency(snapshot.estimatedValue)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{snapshot.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                Snapshot: {new Date(snapshot.snapshotDate).toLocaleDateString()}
              </span>
              {!isPast && (
                <span className="ml-2 font-semibold">
                  ({daysUntil} day{daysUntil !== 1 ? 's' : ''} left)
                </span>
              )}
            </div>
            {snapshot.claimDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  Claim: {new Date(snapshot.claimDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Snapshot Tracker
        </CardTitle>
        <CardDescription>Track upcoming and completed airdrop snapshots</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({data.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="claimable">
              Claimable ({data.claimable.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({data.completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {data.upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming snapshots
              </p>
            ) : (
              data.upcoming.map(renderSnapshot)
            )}
          </TabsContent>

          <TabsContent value="claimable" className="space-y-4 mt-4">
            {data.claimable.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No claimable airdrops
              </p>
            ) : (
              data.claimable.map(renderSnapshot)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {data.completed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No completed snapshots
              </p>
            ) : (
              data.completed.map(renderSnapshot)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}



