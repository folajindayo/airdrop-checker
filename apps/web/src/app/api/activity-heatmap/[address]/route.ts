import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '1y';

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const heatmapData = generateMockHeatmapData(address, timeRange);

    return NextResponse.json(heatmapData);
  } catch (error) {
    console.error('Activity heatmap API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity heatmap' },
      { status: 500 }
    );
  }
}

function generateMockHeatmapData(address: string, timeRange: string) {
  const days = timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Generate daily activity
  const dailyActivity: Record<string, { count: number; value: number }> = {};
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let activeDays = 0;
  let totalTransactions = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Random activity (70% chance of activity)
    if (Math.random() > 0.3) {
      const count = Math.floor(Math.random() * 20) + 1;
      const value = Math.random() * 10000;
      dailyActivity[dateStr] = { count, value };
      activeDays++;
      totalTransactions += count;
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Check if it's today or yesterday for current streak
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo <= 1) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Organize into weeks
  const weeks: any[] = [];
  let currentWeek: any[] = [];
  let weekNumber = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const activity = dailyActivity[dateStr];
    const count = activity?.count || 0;
    const value = activity?.value || 0;

    // Determine activity level (0-4)
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) {
      if (count >= 15) level = 4;
      else if (count >= 10) level = 3;
      else if (count >= 5) level = 2;
      else level = 1;
    }

    currentWeek.push({
      date: dateStr,
      count,
      value,
      level,
    });

    // Start new week on Sunday or when week is full
    if (dayOfWeek === 6 || i === days - 1) {
      // Fill remaining days if week is incomplete
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: '',
          count: 0,
          value: 0,
          level: 0 as const,
        });
      }

      weeks.push({
        week: weekNumber++,
        days: currentWeek,
      });
      currentWeek = [];
    }
  }

  // Day of week pattern
  const dayOfWeekMap: Record<string, { total: number; count: number }> = {
    Sun: { total: 0, count: 0 },
    Mon: { total: 0, count: 0 },
    Tue: { total: 0, count: 0 },
    Wed: { total: 0, count: 0 },
    Thu: { total: 0, count: 0 },
    Fri: { total: 0, count: 0 },
    Sat: { total: 0, count: 0 },
  };

  Object.entries(dailyActivity).forEach(([dateStr, activity]) => {
    const date = new Date(dateStr);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    dayOfWeekMap[dayName].total += activity.count;
    dayOfWeekMap[dayName].count++;
  });

  const dayOfWeekPattern = Object.entries(dayOfWeekMap).map(([day, data]) => ({
    day,
    avgTransactions: data.count > 0 ? data.total / data.count : 0,
  }));

  const mostActiveDay = dayOfWeekPattern.reduce((max, curr) =>
    curr.avgTransactions > max.avgTransactions ? curr : max
  ).day;

  // Monthly activity
  const monthlyMap: Record<string, { transactions: number; value: number }> = {};
  Object.entries(dailyActivity).forEach(([dateStr, activity]) => {
    const date = new Date(dateStr);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { transactions: 0, value: 0 };
    }
    monthlyMap[monthKey].transactions += activity.count;
    monthlyMap[monthKey].value += activity.value;
  });

  const monthlyActivity = Object.entries(monthlyMap)
    .map(([month, data]) => ({
      month,
      transactions: data.transactions,
      value: data.value,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  return {
    weeks,
    stats: {
      totalDays: days,
      activeDays,
      longestStreak,
      currentStreak,
      mostActiveDay,
      averageDailyTx: activeDays > 0 ? totalTransactions / activeDays : 0,
      totalTransactions,
    },
    monthlyActivity,
    dayOfWeekPattern,
  };
}

