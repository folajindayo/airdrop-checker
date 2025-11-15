'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';

interface HeatmapData {
  date: string;
  count: number;
  value: number;
}

interface WalletHeatmapProps {
  data?: HeatmapData[];
  title?: string;
  description?: string;
  className?: string;
}

/**
 * WalletActivityHeatmap - GitHub-style contribution calendar
 * Shows daily transaction activity for the past year
 */
export function WalletActivityHeatmap({
  data = [],
  title = 'Wallet Activity',
  description = 'Transaction activity over the past year',
  className = '',
}: WalletHeatmapProps) {
  const { weeks, maxCount } = useMemo(() => {
    // Generate last 365 days
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    const dateMap = new Map(data.map(d => [d.date, d]));
    const days: (HeatmapData & { dayOfWeek: number })[] = [];

    for (let i = 0; i < 365; i++) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      const dayData = dateMap.get(dateStr);

      days.push({
        date: dateStr,
        count: dayData?.count || 0,
        value: dayData?.value || 0,
        dayOfWeek: current.getDay(),
      });
    }

    // Group into weeks
    const weeks: (HeatmapData & { dayOfWeek: number })[][] = [];
    let currentWeek: (HeatmapData & { dayOfWeek: number })[] = [];

    // Fill first week with empty days if needed
    const firstDayOfWeek = days[0].dayOfWeek;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        count: 0,
        value: 0,
        dayOfWeek: i,
      });
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return { weeks, maxCount };
  }, [data]);

  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    const percentage = count / maxCount;
    if (percentage < 0.25) return 'bg-green-200 dark:bg-green-900';
    if (percentage < 0.5) return 'bg-green-400 dark:bg-green-700';
    if (percentage < 0.75) return 'bg-green-600 dark:bg-green-500';
    return 'bg-green-800 dark:bg-green-400';
  };

  const monthLabels = useMemo(() => {
    const labels: { month: string; offset: number }[] = [];
    let currentMonth = '';

    weeks.forEach((week, index) => {
      const firstDay = week.find(d => d.date);
      if (firstDay && firstDay.date) {
        const date = new Date(firstDay.date);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        if (month !== currentMonth) {
          currentMonth = month;
          labels.push({ month, offset: index * 14 });
        }
      }
    });

    return labels;
  }, [weeks]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex mb-2 text-xs text-muted-foreground">
              {monthLabels.map(({ month, offset }) => (
                <div
                  key={`${month}-${offset}`}
                  className="absolute"
                  style={{ left: `${offset}px` }}
                >
                  {month}
                </div>
              ))}
            </div>

            {/* Day labels */}
            <div className="flex">
              <div className="flex flex-col text-xs text-muted-foreground mr-2 justify-between py-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <Tooltip
                        key={`${weekIndex}-${dayIndex}`}
                        content={
                          day.date ? (
                            <div className="text-xs">
                              <div className="font-semibold">{day.date}</div>
                              <div>{day.count} transactions</div>
                              {day.value > 0 && (
                                <div>${day.value.toFixed(2)} volume</div>
                              )}
                            </div>
                          ) : (
                            ''
                          )
                        }
                      >
                        <div
                          className={`w-3 h-3 rounded-sm transition-colors ${
                            day.date ? getIntensity(day.count) : 'bg-transparent'
                          }`}
                        />
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end mt-4 gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-400" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <div className="text-2xl font-bold">
              {data.reduce((sum, d) => sum + d.count, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Transactions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {data.filter(d => d.count > 0).length}
            </div>
            <div className="text-xs text-muted-foreground">Active Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              ${data.reduce((sum, d) => sum + d.value, 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Total Volume</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * CompactHeatmap - Smaller version for cards
 */
export function CompactWalletHeatmap({
  data = [],
  className = '',
}: {
  data?: HeatmapData[];
  className?: string;
}) {
  const last90Days = useMemo(() => {
    const today = new Date();
    const days: HeatmapData[] = [];

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = data.find(d => d.date === dateStr);
      days.push(dayData || { date: dateStr, count: 0, value: 0 });
    }

    return days;
  }, [data]);

  const maxCount = Math.max(...last90Days.map(d => d.count), 1);

  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    const percentage = count / maxCount;
    if (percentage < 0.25) return 'bg-green-200 dark:bg-green-900';
    if (percentage < 0.5) return 'bg-green-400 dark:bg-green-700';
    if (percentage < 0.75) return 'bg-green-600 dark:bg-green-500';
    return 'bg-green-800 dark:bg-green-400';
  };

  return (
    <div className={`flex gap-0.5 ${className}`}>
      {last90Days.map((day, index) => (
        <Tooltip
          key={index}
          content={
            <div className="text-xs">
              <div className="font-semibold">{day.date}</div>
              <div>{day.count} transactions</div>
            </div>
          }
        >
          <div
            className={`w-1 h-8 rounded-sm transition-colors ${getIntensity(
              day.count
            )}`}
          />
        </Tooltip>
      ))}
    </div>
  );
}

