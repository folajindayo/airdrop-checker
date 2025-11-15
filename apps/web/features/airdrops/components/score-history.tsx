'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ScoreSnapshot {
  timestamp: string;
  score: number;
  eligibleAirdrops: number;
}

interface ScoreHistoryProps {
  address: string;
  currentScore: number;
  currentEligibleAirdrops: number;
}

const STORAGE_KEY_PREFIX = 'airdrop-score-history-';
const MAX_HISTORY_DAYS = 30;

export function ScoreHistory({
  address,
  currentScore,
  currentEligibleAirdrops,
}: ScoreHistoryProps) {
  const [history, setHistory] = useState<ScoreSnapshot[]>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    if (!address) return;

    const storageKey = STORAGE_KEY_PREFIX + address.toLowerCase();

    // Load existing history
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed: ScoreSnapshot[] = JSON.parse(stored);
          
          // Remove entries older than MAX_HISTORY_DAYS
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
          
          const filtered = parsed.filter(
            (entry) => new Date(entry.timestamp) > cutoffDate
          );
          
          setHistory(filtered);
          return filtered;
        }
      } catch (error) {
        console.error('Failed to load score history:', error);
      }
      return [];
    };

    const existingHistory = loadHistory();

    // Add new snapshot if score changed or it's been >1 hour since last snapshot
    const shouldAddSnapshot = () => {
      if (existingHistory.length === 0) return true;

      const lastSnapshot = existingHistory[existingHistory.length - 1];
      const lastTimestamp = new Date(lastSnapshot.timestamp);
      const hoursSinceLastSnapshot =
        (Date.now() - lastTimestamp.getTime()) / (1000 * 60 * 60);

      // Add snapshot if score changed or it's been >1 hour
      return (
        lastSnapshot.score !== currentScore ||
        lastSnapshot.eligibleAirdrops !== currentEligibleAirdrops ||
        hoursSinceLastSnapshot >= 1
      );
    };

    if (shouldAddSnapshot()) {
      const newSnapshot: ScoreSnapshot = {
        timestamp: new Date().toISOString(),
        score: currentScore,
        eligibleAirdrops: currentEligibleAirdrops,
      };

      const updatedHistory = [...existingHistory, newSnapshot];
      setHistory(updatedHistory);

      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to save score history:', error);
      }

      // Calculate trend
      if (existingHistory.length > 0) {
        const lastScore = existingHistory[existingHistory.length - 1].score;
        if (currentScore > lastScore) {
          setTrend('up');
        } else if (currentScore < lastScore) {
          setTrend('down');
        } else {
          setTrend('neutral');
        }
      }
    } else {
      // Still calculate trend from existing history
      if (existingHistory.length >= 2) {
        const lastScore = existingHistory[existingHistory.length - 1].score;
        const previousScore = existingHistory[existingHistory.length - 2].score;
        if (lastScore > previousScore) {
          setTrend('up');
        } else if (lastScore < previousScore) {
          setTrend('down');
        }
      }
    }
  }, [address, currentScore, currentEligibleAirdrops]);

  const chartData = history.map((entry) => ({
    date: new Date(entry.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: entry.score,
    airdrops: entry.eligibleAirdrops,
  }));

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case 'up':
        return 'Improving';
      case 'down':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (history.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score History</CardTitle>
          <CardDescription>
            Track your eligibility score over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Not enough data yet</p>
            <p className="text-sm mt-2">
              Check back later to see your score trends
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreChange = history.length >= 2
    ? history[history.length - 1].score - history[0].score
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score History</CardTitle>
        <CardDescription>
          Your eligibility score over the last {MAX_HISTORY_DAYS} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Trend Summary */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <div>
              <div className={`font-semibold ${getTrendColor()}`}>
                {getTrendText()}
              </div>
              <div className="text-sm text-muted-foreground">
                {history.length} data points
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentScore}</div>
            <div className={`text-sm ${scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {scoreChange >= 0 ? '+' : ''}{scoreChange} points
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ fill: '#4f46e5', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Peak Score</div>
            <div className="text-lg font-bold">
              {Math.max(...history.map((h) => h.score))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Lowest Score</div>
            <div className="text-lg font-bold">
              {Math.min(...history.map((h) => h.score))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Avg Score</div>
            <div className="text-lg font-bold">
              {Math.round(
                history.reduce((sum, h) => sum + h.score, 0) / history.length
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

