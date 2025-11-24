import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface LeaderboardEntry {
  rank: number;
  address: string;
  overallScore: number;
  topAirdrop: {
    projectId: string;
    score: number;
  };
  totalAirdrops: number;
  lastUpdated: number;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalParticipants: number;
  yourRank?: number;
  timestamp: number;
}

// Mock leaderboard data - in production, this would come from a database
const generateMockLeaderboard = (): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];
  const projects = ['zora', 'layerzero', 'starknet', 'zksync', 'arbitrum'];
  
  for (let i = 0; i < 100; i++) {
    const score = Math.floor(Math.random() * 100);
    entries.push({
      rank: i + 1,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      overallScore: score,
      topAirdrop: {
        projectId: projects[Math.floor(Math.random() * projects.length)],
        score: Math.floor(Math.random() * 100),
      },
      totalAirdrops: Math.floor(Math.random() * 20) + 5,
      lastUpdated: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    });
  }
  
  return entries.sort((a, b) => b.overallScore - a.overallScore).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '50');

    const cacheKey = 'leaderboard';
    const cachedResult = cache.get<LeaderboardData>(cacheKey);

    let leaderboard: LeaderboardData;

    if (cachedResult) {
      leaderboard = cachedResult;
    } else {
      const entries = generateMockLeaderboard();
      leaderboard = {
        entries: entries.slice(0, limit),
        totalParticipants: entries.length,
        timestamp: Date.now(),
      };
      cache.set(cacheKey, leaderboard, 5 * 60 * 1000); // Cache for 5 minutes
    }

    // Find user's rank if address provided
    if (address) {
      const normalizedAddress = address.toLowerCase();
      const userEntry = leaderboard.entries.find(
        (e) => e.address.toLowerCase() === normalizedAddress
      );
      if (userEntry) {
        leaderboard.yourRank = userEntry.rank;
      } else {
        // Estimate rank based on score (would need actual score in production)
        leaderboard.yourRank = Math.floor(Math.random() * leaderboard.totalParticipants) + 1;
      }
    }

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, overallScore, airdrops } = body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // In production, this would update a database
    // For now, we'll just invalidate the cache
    cache.delete('leaderboard');

    return NextResponse.json({
      success: true,
      message: 'Score submitted to leaderboard',
    });
  } catch (error) {
    console.error('Error submitting to leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to submit to leaderboard' },
      { status: 500 }
    );
  }
}
