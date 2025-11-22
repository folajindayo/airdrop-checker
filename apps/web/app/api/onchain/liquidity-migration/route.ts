import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { LiquidityMigrationRequest, LiquidityMigrationReport, LiquidityMigration } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: LiquidityMigrationRequest = await request.json();
    const { tokenAddress, chainId, timeRange = 30 } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    const chain = chains[chainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Analyze liquidity migrations (simplified - would need DEX event analysis)
    const migrations: LiquidityMigration[] = [];
    
    // In production, this would:
    // 1. Query DEX events for liquidity removals
    // 2. Query DEX events for liquidity additions
    // 3. Match removals to additions to identify migrations
    // 4. Track which DEX liquidity moved to

    const dexCounts: Record<string, number> = {};
    migrations.forEach(migration => {
      dexCounts[migration.toDex] = (dexCounts[migration.toDex] || 0) + 1;
    });

    const topDestination = Object.entries(dexCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

    const netLiquidityChange = migrations.reduce((sum, m) => {
      return (BigInt(sum) + BigInt(m.amount)).toString();
    }, '0');

    const report: LiquidityMigrationReport = {
      tokenAddress,
      migrations,
      totalMigrations: migrations.length,
      netLiquidityChange,
      topDestination,
    };

    return NextResponse.json({
      success: true,
      ...report,
      type: 'liquidity-migration-report',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze liquidity migrations' },
      { status: 500 }
    );
  }
}

