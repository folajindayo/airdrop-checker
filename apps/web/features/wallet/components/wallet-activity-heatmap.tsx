'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Activity,
  Calendar,
  TrendingUp,
  Flame,
  Zap,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface DayActivity {
  date: string;
  count: number;
  value: number;
  level: 0 | 1 | 2 | 3 | 4; // Activity level for color intensity
}

interface WeekActivity {
  week: number;
  days: DayActivity[];
}

interface ActivityStats {
  totalDays: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
  mostActiveDay: string;
  averageDailyTx: number;
  totalTransactions: number;
}

interface HeatmapData {
  weeks: WeekActivity[];
  stats: ActivityStats;
  monthlyActivity: { month: string; transactions: number; value: number }[];
  dayOfWeekPattern: { day: string; avgTransactions: number }[];
}

interface WalletActivityHeatmapProps {
  address: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function WalletActivityHeatmap({ address }: WalletActivityHeatmapProps) {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('1y');

  useEffect(() => {
    if (address) {
      fetchActivityData();
    }
  }, [address, timeRange]);

  async function fetchActivityData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/activity-heatmap/${address}?timeRange=${timeRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching activity heatmap:', error);
      toast.error('Failed to load activity heatmap');
    } finally {
      setLoading(false);
    }
  }

  function getActivityColor(level: number): string {
    const colors = {
      0: 'bg-muted',
      1: 'bg-green-200 dark:bg-green-900/30',
      2: 'bg-green-400 dark:bg-green-700/50',
      3: 'bg-green-600 dark:bg-green-600/70',
      4: 'bg-green-800 dark:bg-green-500',
    };
    return colors[level as keyof typeof colors] || colors[0];
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No activity data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['3m', '6m', '1y'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : '1 Year'}
          </Button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Active Days</p>
          </div>
          <p className="text-2xl font-bold">{data.stats.activeDays}</p>
          <p className="text-xs text-muted-foreground">of {data.stats.totalDays} days</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-600" />
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
          <p className="text-2xl font-bold">{data.stats.currentStreak}</p>
          <p className="text-xs text-muted-foreground">days</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
          <p className="text-2xl font-bold">{data.stats.longestStreak}</p>
          <p className="text-xs text-muted-foreground">days</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-muted-foreground">Avg Daily Tx</p>
          </div>
          <p className="text-2xl font-bold">{data.stats.averageDailyTx.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">transactions</p>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activity Heatmap</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-3 w-3 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Month labels */}
        <div className="flex gap-1 mb-2 ml-12">
          {MONTHS.map((month, index) => (
            <div key={month} className="flex-1 text-xs text-muted-foreground text-center">
              {index % 3 === 0 ? month : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 justify-around">
            {DAYS.map((day, index) => (
              <div key={day} className="h-3 text-xs text-muted-foreground flex items-center">
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Activity grid */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1">
              {data.weeks.map((week) => (
                <div key={week.week} className="flex flex-col gap-1">
                  {week.days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`h-3 w-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary ${getActivityColor(
                        day.level
                      )}`}
                      onClick={() => setSelectedDay(day)}
                      title={`${day.date}: ${day.count} transactions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected day info */}
        {selectedDay && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{new Date(selectedDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDay.count} transactions · ${selectedDay.value.toLocaleString()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                ✕
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Day of Week Pattern */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity by Day of Week</h3>
        <div className="space-y-3">
          {data.dayOfWeekPattern.map((pattern, index) => {
            const maxTx = Math.max(...data.dayOfWeekPattern.map((p) => p.avgTransactions));
            const percentage = (pattern.avgTransactions / maxTx) * 100;

            return (
              <div key={pattern.day}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium w-16">{pattern.day}</span>
                  <span className="text-sm text-muted-foreground">
                    {pattern.avgTransactions.toFixed(1)} avg tx
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Monthly Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.monthlyActivity.map((month) => (
            <div key={month.month} className="p-4 bg-muted/50 rounded-lg">
              <p className="font-semibold mb-2">{month.month}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-medium">{month.transactions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-medium">${month.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <Activity className="h-8 w-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Activity Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  Most active on {data.stats.mostActiveDay}s with an average of{' '}
                  {data.dayOfWeekPattern.find((p) => p.day === data.stats.mostActiveDay)?.avgTransactions.toFixed(1)}{' '}
                  transactions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Flame className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span>
                  Current activity streak: {data.stats.currentStreak} days
                  {data.stats.currentStreak >= data.stats.longestStreak && ' (New record!)'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Active on {((data.stats.activeDays / data.stats.totalDays) * 100).toFixed(1)}% of days in the selected period
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

