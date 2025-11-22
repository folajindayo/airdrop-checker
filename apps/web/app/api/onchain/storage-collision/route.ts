import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { StorageCollisionRequest, StorageCollisionReport, StorageCollision } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: StorageCollisionRequest = await request.json();
    const { contractAddress, upgradeAddress, chainId } = body;

    if (!contractAddress || !upgradeAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: contractAddress, upgradeAddress' },
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

    // Check for storage collisions (simplified)
    const collisions: StorageCollision[] = [];
    
    for (let i = 0; i < 10; i++) {
      try {
        const currentValue = await publicClient.getStorageAt({
          address: contractAddress,
          slot: BigInt(i),
        });
        
        const upgradeValue = await publicClient.getStorageAt({
          address: upgradeAddress,
          slot: BigInt(i),
        });

        if (currentValue && upgradeValue && currentValue !== upgradeValue) {
          collisions.push({
            slot: i,
            variable: `variable_${i}`,
            collisionType: 'overwrite',
            severity: 'medium',
          });
        }
      } catch {
        // Skip invalid slots
      }
    }

    const hasCollisions = collisions.length > 0;
    const riskLevel = collisions.some(c => c.severity === 'critical' || c.severity === 'high')
      ? 'high'
      : hasCollisions
      ? 'medium'
      : 'low';

    const report: StorageCollisionReport = {
      contractAddress,
      upgradeAddress,
      collisions,
      hasCollisions,
      riskLevel,
    };

    return NextResponse.json({
      success: true,
      ...report,
      type: 'storage-collision-report',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to detect storage collisions' },
      { status: 500 }
    );
  }
}

