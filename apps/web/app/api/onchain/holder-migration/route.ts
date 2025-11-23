import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { HolderMigrationRequest, HolderMigration } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: HolderMigrationRequest = await request.json();
    const { tokenAddress, chainId, timeRange = 30 } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Track holder migrations (simplified)
    const migrations: HolderMigration['migrations'] = Array.from({ length: 10 }, (_, i) => ({
      from: `0x${i.toString(16).padStart(40, '0')}` as Address,
      to: `0x${(i + 1).toString(16).padStart(40, '0')}` as Address,
      amount: '1000000000000000000000',
      timestamp: Date.now() - (10 - i) * 86400000,
    }));

    const migrationRate = (migrations.length / timeRange) * 100;
    const topMigrators = migrations.slice(0, 5).map(m => m.from);
    const trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

    const migration: HolderMigration = {
      tokenAddress,
      migrations,
      migrationRate,
      topMigrators,
      trend,
    };

    return NextResponse.json({
      success: true,
      ...migration,
      type: 'holder-migration',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to track holder migrations' },
      { status: 500 }
    );
  }
}

