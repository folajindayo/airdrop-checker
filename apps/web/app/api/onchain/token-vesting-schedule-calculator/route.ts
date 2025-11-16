import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vestingAddress = searchParams.get('vestingAddress');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!vestingAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: vestingAddress' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const code = await publicClient.getBytecode({
      address: vestingAddress as Address,
    });

    return NextResponse.json({
      success: true,
      vestingAddress,
      chainId,
      vestingSchedule: {
        totalAmount: '0',
        unlockedAmount: '0',
        lockedAmount: '0',
        unlockSchedule: [],
        nextUnlock: null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate vesting schedule' },
      { status: 500 }
    );
  }
}

