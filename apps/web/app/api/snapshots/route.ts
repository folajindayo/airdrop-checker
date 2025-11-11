import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

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

// Mock snapshot data - in production, this would come from a database
const MOCK_SNAPSSHOTS: Snapshot[] = [
  {
    id: 'snapshot-1',
    projectId: 'zora',
    projectName: 'Zora',
    snapshotDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    description: 'Zora Network snapshot for airdrop eligibility',
    estimatedValue: 1000,
    chainIds: [1, 8453],
  },
  {
    id: 'snapshot-2',
    projectId: 'layerzero',
    projectName: 'LayerZero',
    snapshotDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    description: 'LayerZero omnichain snapshot',
    estimatedValue: 2500,
    chainIds: [1, 10, 42161, 137],
  },
  {
    id: 'snapshot-3',
    projectId: 'starknet',
    projectName: 'Starknet',
    snapshotDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    claimDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'claimable',
    description: 'Starknet airdrop claim window open',
    estimatedValue: 5000,
    chainIds: [1],
  },
  {
    id: 'snapshot-4',
    projectId: 'zksync',
    projectName: 'zkSync Era',
    snapshotDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    claimDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    description: 'zkSync Era airdrop completed',
    estimatedValue: 4000,
    chainIds: [324],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');

    const cacheKey = `snapshots:${status || 'all'}:${projectId || 'all'}`;
    const cachedResult = cache.get<SnapshotsData>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    let snapshots = [...MOCK_SNAPSSHOTS];

    // Filter by status
    if (status) {
      snapshots = snapshots.filter((s) => s.status === status);
    }

    // Filter by project
    if (projectId) {
      snapshots = snapshots.filter((s) => s.projectId === projectId);
    }

    // Sort by date
    snapshots.sort((a, b) => 
      new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
    );

    const result: SnapshotsData = {
      snapshots,
      upcoming: snapshots.filter((s) => s.status === 'upcoming'),
      completed: snapshots.filter((s) => s.status === 'completed'),
      claimable: snapshots.filter((s) => s.status === 'claimable'),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}



