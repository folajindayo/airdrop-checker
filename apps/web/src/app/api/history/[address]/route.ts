import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface HistoryEntry {
  id: string;
  address: string;
  timestamp: number;
  overallScore: number;
  airdrops: Array<{
    projectId: string;
    projectName: string;
    score: number;
    status: string;
  }>;
  changes?: {
    scoreDelta: number;
    newAirdrops: string[];
    improvedAirdrops: string[];
    declinedAirdrops: string[];
  };
}

// In-memory storage (in production, use database)
const historyStore = new Map<string, HistoryEntry[]>();

/**
 * POST /api/history/[address]
 * Record a new history entry for an address
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const body = await request.json();
    const { overallScore, airdrops } = body;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!overallScore || !airdrops) {
      return NextResponse.json(
        { success: false, error: 'overallScore and airdrops are required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const history = historyStore.get(normalizedAddress) || [];
    
    // Get previous entry to calculate changes
    const previousEntry = history.length > 0 ? history[history.length - 1] : null;
    
    const newEntry: HistoryEntry = {
      id: `history-${normalizedAddress}-${Date.now()}`,
      address: normalizedAddress,
      timestamp: Date.now(),
      overallScore,
      airdrops: airdrops.map((a: any) => ({
        projectId: a.projectId || a.id,
        projectName: a.project || a.name,
        score: a.score,
        status: a.status,
      })),
    };

    // Calculate changes if previous entry exists
    if (previousEntry) {
      const scoreDelta = overallScore - previousEntry.overallScore;
      const previousAirdropMap = new Map(
        previousEntry.airdrops.map(a => [a.projectId, a.score])
      );
      const currentAirdropMap = new Map(
        newEntry.airdrops.map(a => [a.projectId, a.score])
      );

      const newAirdrops: string[] = [];
      const improvedAirdrops: string[] = [];
      const declinedAirdrops: string[] = [];

      // Check for new airdrops
      newEntry.airdrops.forEach(a => {
        if (!previousAirdropMap.has(a.projectId)) {
          newAirdrops.push(a.projectId);
        }
      });

      // Check for improved/declined airdrops
      newEntry.airdrops.forEach(a => {
        const previousScore = previousAirdropMap.get(a.projectId);
        if (previousScore !== undefined) {
          if (a.score > previousScore) {
            improvedAirdrops.push(a.projectId);
          } else if (a.score < previousScore) {
            declinedAirdrops.push(a.projectId);
          }
        }
      });

      newEntry.changes = {
        scoreDelta,
        newAirdrops,
        improvedAirdrops,
        declinedAirdrops,
      };
    }

    history.push(newEntry);
    
    // Keep only last 100 entries per address
    if (history.length > 100) {
      history.shift();
    }
    
    historyStore.set(normalizedAddress, history);

    return NextResponse.json({
      success: true,
      entry: newEntry,
      message: 'History entry recorded',
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/history/[address]
 * Get history for an address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    let history = historyStore.get(normalizedAddress) || [];

    // Filter by days
    if (days > 0) {
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
      history = history.filter(entry => entry.timestamp >= cutoffTime);
    }

    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    const limitedHistory = history.slice(0, limit);

    // Calculate statistics
    const stats = {
      totalEntries: history.length,
      averageScore: history.length > 0
        ? Math.round(history.reduce((sum, e) => sum + e.overallScore, 0) / history.length)
        : 0,
      highestScore: history.length > 0
        ? Math.max(...history.map(e => e.overallScore))
        : 0,
      lowestScore: history.length > 0
        ? Math.min(...history.map(e => e.overallScore))
        : 0,
      scoreTrend: history.length >= 2
        ? history[0].overallScore - history[history.length - 1].overallScore
        : 0,
      totalImprovements: history.filter(e => e.changes && e.changes.scoreDelta > 0).length,
      totalDeclines: history.filter(e => e.changes && e.changes.scoreDelta < 0).length,
    };

    return NextResponse.json({
      success: true,
      history: limitedHistory,
      stats,
      count: limitedHistory.length,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
