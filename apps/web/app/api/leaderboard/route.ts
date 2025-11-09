import { NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard
 * Get leaderboard of top airdrop farmers (mock data for now)
 * In production, this would aggregate real user data
 */
export async function GET() {
  try {
    const projects = await findAllProjects();
    const confirmedCount = projects.filter((p) => p.status === 'confirmed').length;

    // Mock leaderboard data (in production, aggregate from real user data)
    const leaderboard = [
      {
        rank: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        score: 95,
        eligibleCount: confirmedCount - 1,
        chainsUsed: 6,
        totalValue: 15000,
        avatar: null,
      },
      {
        rank: 2,
        address: '0x8ba1f109551bD432803012645Hac136c22C19c00',
        score: 92,
        eligibleCount: confirmedCount - 2,
        chainsUsed: 5,
        totalValue: 12000,
        avatar: null,
      },
      {
        rank: 3,
        address: '0x1234567890123456789012345678901234567890',
        score: 88,
        eligibleCount: confirmedCount - 3,
        chainsUsed: 4,
        totalValue: 10000,
        avatar: null,
      },
      {
        rank: 4,
        address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        score: 85,
        eligibleCount: confirmedCount - 4,
        chainsUsed: 4,
        totalValue: 8500,
        avatar: null,
      },
      {
        rank: 5,
        address: '0xfedcbafedcbafedcbafedcbafedcbafedcbafedc',
        score: 82,
        eligibleCount: confirmedCount - 5,
        chainsUsed: 3,
        totalValue: 7000,
        avatar: null,
      },
    ].map((entry) => ({
      ...entry,
      address: `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`,
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
      totalParticipants: 1250, // Mock count
      yourRank: null, // Would be calculated if address provided
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

