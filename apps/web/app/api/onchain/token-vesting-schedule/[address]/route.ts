import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

const VESTING_ABI = [
  {
    inputs: [{ name: 'beneficiary', type: 'address' }],
    name: 'getVestingSchedule',
    outputs: [
      { name: 'startTime', type: 'uint256' },
      { name: 'cliff', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'released', type: 'uint256' },
    ],
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const vestingContract = searchParams.get('contract');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-vesting:${normalizedAddress}:${vestingContract || 'all'}:${chainId || 'all'}`;
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

    const vestingSchedules: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        if (vestingContract) {
          try {
            const releasable = await publicClient.readContract({
              address: vestingContract as `0x${string}`,
              abi: VESTING_ABI,
              functionName: 'releasable',
              args: [normalizedAddress],
            });

            vestingSchedules.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              vestingContract: vestingContract.toLowerCase(),
              beneficiary: normalizedAddress,
              releasable: releasable.toString(),
              formattedReleasable: formatUnits(releasable, 18),
            });
          } catch (error) {
            console.error(`Error reading vesting contract on ${chainConfig.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error fetching vesting schedule on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      vestingSchedules,
      totalSchedules: vestingSchedules.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain vesting schedule API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch on-chain vesting schedules',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

