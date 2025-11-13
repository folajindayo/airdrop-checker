'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  address?: string;
  className?: string;
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  overallScore: number;
  topAirdrop: {
    projectId: string;
    score: number;
  };
  totalAirdrops: number;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalParticipants: number;
  yourRank?: number;
  timestamp: number;
}

export function Leaderboard({ address, className = '' }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      
      try {
        const url = address 
          ? `/api/leaderboard?address=${address}&limit=50`
          : '/api/leaderboard?limit=50';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        
        const leaderboardData = await response.json();
        setData(leaderboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [address]);

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
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Error loading leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-500" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
    return '';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Airdrop Leaderboard
        </CardTitle>
        <CardDescription>
          Top performers by overall airdrop eligibility score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Participants</p>
            <p className="text-2xl font-bold mt-1">{data.totalParticipants}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Top Score</p>
            <p className="text-2xl font-bold mt-1">
              {data.entries[0]?.overallScore || 0}
            </p>
          </div>
          {data.yourRank && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-300">Your Rank</p>
              <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                #{data.yourRank}
              </p>
            </div>
          )}
        </div>

        {/* Top 3 */}
        {data.entries.slice(0, 3).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold mb-2">Top 3</h3>
            {data.entries.slice(0, 3).map((entry) => (
              <div
                key={entry.rank}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-lg",
                  getRankColor(entry.rank)
                )}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">#{entry.rank}</span>
                      <span className="font-mono text-sm">{formatAddress(entry.address)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Top: {entry.topAirdrop.projectId} ({entry.topAirdrop.score}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{entry.overallScore}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.totalAirdrops} airdrops
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rest of leaderboard */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">All Rankings</h3>
          {data.entries.slice(3).map((entry) => {
            const isYourAddress = address && entry.address.toLowerCase() === address.toLowerCase();
            return (
              <div
                key={entry.rank}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors",
                  isYourAddress && "bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold w-8">#{entry.rank}</span>
                  <div>
                    <span className="font-mono text-sm">{formatAddress(entry.address)}</span>
                    {isYourAddress && (
                      <Badge variant="default" className="ml-2">You</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{entry.overallScore}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.totalAirdrops} airdrops
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}



