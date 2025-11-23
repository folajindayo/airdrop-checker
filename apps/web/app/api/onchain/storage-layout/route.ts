import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { StorageLayoutRequest, StorageLayout, StorageSlot } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: StorageLayoutRequest = await request.json();
    const { contractAddress, chainId } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
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

    // Analyze storage layout (simplified - would need contract source)
    const slots: StorageSlot[] = [];
    
    // Sample storage slots analysis
    for (let i = 0; i < 10; i++) {
      try {
        const value = await publicClient.getStorageAt({
          address: contractAddress,
          slot: BigInt(i),
        });
        
        if (value && value !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          slots.push({
            slot: i,
            variable: `variable_${i}`,
            type: 'uint256',
            offset: 0,
            size: 32,
          });
        }
      } catch {
        // Skip invalid slots
      }
    }

    const packedSlots = slots.filter(s => s.size < 32).length;

    const layout: StorageLayout = {
      contractAddress,
      slots,
      totalSlots: slots.length,
      packedSlots,
    };

    return NextResponse.json({
      success: true,
      ...layout,
      type: 'storage-layout',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze storage layout' },
      { status: 500 }
    );
  }
}


