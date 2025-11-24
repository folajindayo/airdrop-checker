'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { CardLoader } from '@/components/ui/loading-states';
import { ErrorState, NoUpcomingEvents } from '@/components/ui/empty-state';
import { InlineAlert } from '@/components/ui/alert';
import { format, parseISO, isPast, isFuture, isToday } from 'date-fns';

interface AirdropEvent {
  projectName: string;
  eventType: 'snapshot' | 'claim' | 'announcement';
  date: string;
  description: string;
  status: 'upcoming' | 'past' | 'active';
}

interface CalendarData {
  upcoming: AirdropEvent[];
  today: AirdropEvent[];
  past: AirdropEvent[];
}

export default function CalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar');
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Airdrop Calendar</h1>
          <p className="text-muted-foreground">
            Track important dates for snapshots, claims, and announcements
          </p>
        </div>
        <CardLoader message="Loading calendar events..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Airdrop Calendar</h1>
          <p className="text-muted-foreground">
            Track important dates for snapshots, claims, and announcements
          </p>
        </div>
        <ErrorState
          title="Failed to load calendar"
          description={error}
          onRetry={fetchCalendarData}
        />
      </div>
    );
  }

  const hasNoEvents =
    (!data?.today || data.today.length === 0) &&
    (!data?.upcoming || data.upcoming.length === 0);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'snapshot':
        return <Camera className="h-4 w-4" />;
      case 'claim':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'announcement':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'snapshot':
        return 'default';
      case 'claim':
        return 'secondary';
      case 'announcement':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Airdrop Calendar</h1>
        <p className="text-muted-foreground">
          Track important dates for snapshots, claims, and announcements
        </p>
      </div>

      {/* Info Alert */}
      <InlineAlert variant="info">
        <p>
          <strong>Stay Informed:</strong> Mark your calendar for snapshot dates to ensure
          you maintain eligibility, and don't miss claim windows for airdrops you qualify
          for.
        </p>
      </InlineAlert>

      {hasNoEvents ? (
        <NoUpcomingEvents />
      ) : (
        <div className="space-y-6">
          {/* Today's Events */}
          {data?.today && data.today.length > 0 && (
            <Card className="border-blue-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <CardTitle>Today's Events</CardTitle>
                  <Badge variant="secondary">{data.today.length}</Badge>
                </div>
                <CardDescription>Events happening today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.today.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-blue-50 border-blue-200"
                  >
                    <div className="p-2 rounded-full bg-blue-100">
                      {getEventIcon(event.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{event.projectName}</h3>
                        <Badge variant={getEventBadgeVariant(event.eventType)}>
                          {event.eventType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">Today</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          {data?.upcoming && data.upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <CardTitle>Upcoming Events</CardTitle>
                  <Badge variant="secondary">{data.upcoming.length}</Badge>
                </div>
                <CardDescription>
                  Scheduled snapshots, claims, and announcements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.upcoming.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="p-2 rounded-full bg-muted">
                      {getEventIcon(event.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{event.projectName}</h3>
                        <Badge variant={getEventBadgeVariant(event.eventType)}>
                          {event.eventType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Snapshot</p>
                    <p className="text-xs text-muted-foreground">
                      Eligibility recorded
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Claim</p>
                    <p className="text-xs text-muted-foreground">
                      Rewards available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Announcement</p>
                    <p className="text-xs text-muted-foreground">
                      Important updates
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

