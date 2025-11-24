import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Token unlock schedule ABI
const UNLOCK_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'lockedBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'unlockSchedule',
    outputs: [
      { name: 'totalLocked', type: 'uint256' },
      { name: 'unlocked', type: 'uint256' },
      { name: 'nextUnlock', type: 'uint256' },
      { name: 'unlockRate', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unlockPeriod',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

/**
 * GET /api/onchain/token-unlock-schedule/[address]
 * Track on-chain token unlock schedules for a wallet address
 * Monitors linear and cliff unlock mechanisms
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lockContract = searchParams.get('contract');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-unlock:${normalizedAddress}:${lockContract || 'all'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? chains.filter((c) => c.id === parseInt(chainId))
      : chains;

    const unlockSchedules: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        if (lockContract && isValidAddress(lockContract)) {
          try {
            const lockedBalance = await publicClient.readContract({
              address: lockContract as `0x${string}`,
              abi: UNLOCK_ABI,
              functionName: 'lockedBalance',
              args: [normalizedAddress],
            });

            let unlockPeriod = 0n;
            try {
              unlockPeriod = await publicClient.readContract({
                address: lockContract as `0x${string}`,
                abi: UNLOCK_ABI,
                functionName: 'unlockPeriod',
              });
            } catch {
              // Function might not exist
            }

            unlockSchedules.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              lockContract: lockContract.toLowerCase(),
              address: normalizedAddress,
              lockedBalance: lockedBalance.toString(),
              formattedLockedBalance: formatUnits(lockedBalance, 18),
              unlockPeriod: unlockPeriod.toString(),
              unlockPeriodDays: unlockPeriod > 0n ? Number(unlockPeriod) / 86400 : null,
            });
          } catch (error) {
            console.error(`Error reading unlock contract on ${chainConfig.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error fetching unlock schedule on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      unlockSchedules,
      totalSchedules: unlockSchedules.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain unlock schedule API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch on-chain unlock schedules',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

