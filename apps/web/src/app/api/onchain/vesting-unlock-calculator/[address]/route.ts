import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Vesting calculator ABI
const VESTING_CALC_ABI = [
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
  {
    inputs: [{ name: 'beneficiary', type: 'address' }, { name: 'timestamp', type: 'uint256' }],
    name: 'vestedAmount',
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
 * GET /api/onchain/vesting-unlock-calculator/[address]
 * Calculate on-chain token vesting unlock amounts and schedules
 * Provides vesting calculations for future dates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const vestingContract = searchParams.get('contract');
    const futureDate = searchParams.get('futureDate');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!vestingContract || !isValidAddress(vestingContract)) {
      return NextResponse.json(
        { error: 'Valid vesting contract address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const futureTimestamp = futureDate
      ? BigInt(Math.floor(new Date(futureDate).getTime() / 1000))
      : null;

    const cacheKey = `onchain-unlock-calc:${normalizedAddress}:${vestingContract}:${futureTimestamp || 'current'}:${chainId || 'all'}`;
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

    const calculationResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const vestingSchedule = await publicClient.readContract({
            address: vestingContract as `0x${string}`,
            abi: VESTING_CALC_ABI,
            functionName: 'getVestingSchedule',
            args: [normalizedAddress],
          });

          const startTime = BigInt(vestingSchedule[0]);
          const cliff = BigInt(vestingSchedule[1]);
          const duration = BigInt(vestingSchedule[2]);
          const totalAmount = BigInt(vestingSchedule[3]);
          const released = BigInt(vestingSchedule[4]);

          const currentTime = BigInt(Math.floor(Date.now() / 1000));
          const targetTime = futureTimestamp || currentTime;

          // Calculate vested amount at target time
          let vestedAtTarget = 0n;
          if (targetTime < startTime) {
            vestedAtTarget = 0n;
          } else if (targetTime < startTime + cliff) {
            vestedAtTarget = 0n; // Before cliff
          } else if (targetTime >= startTime + duration) {
            vestedAtTarget = totalAmount; // Fully vested
          } else {
            // Linear vesting calculation
            const elapsed = targetTime - startTime - cliff;
            vestedAtTarget = (totalAmount * elapsed) / duration;
          }

          const cliffEnd = startTime + cliff;
          const vestingEnd = startTime + duration;
          const releasable = vestedAtTarget > released ? vestedAtTarget - released : 0n;

          // Calculate daily unlock rate
          const dailyUnlock = duration > 0n ? totalAmount / duration : 0n;

          calculationResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            vestingContract: vestingContract.toLowerCase(),
            beneficiary: normalizedAddress,
            schedule: {
              startTime: startTime.toString(),
              startDate: new Date(Number(startTime) * 1000).toISOString(),
              cliff: cliff.toString(),
              cliffEnd: cliffEnd.toString(),
              cliffEndDate: new Date(Number(cliffEnd) * 1000).toISOString(),
              duration: duration.toString(),
              durationDays: Number(duration) / 86400,
              vestingEnd: vestingEnd.toString(),
              vestingEndDate: new Date(Number(vestingEnd) * 1000).toISOString(),
            },
            amounts: {
              totalAmount: totalAmount.toString(),
              formattedTotalAmount: formatUnits(totalAmount, 18),
              released: released.toString(),
              formattedReleased: formatUnits(released, 18),
              vestedAtTarget: vestedAtTarget.toString(),
              formattedVestedAtTarget: formatUnits(vestedAtTarget, 18),
              releasable: releasable.toString(),
              formattedReleasable: formatUnits(releasable, 18),
              dailyUnlock: dailyUnlock.toString(),
              formattedDailyUnlock: formatUnits(dailyUnlock, 18),
            },
            calculation: {
              targetTime: targetTime.toString(),
              targetDate: new Date(Number(targetTime) * 1000).toISOString(),
              vestingProgress: duration > 0n
                ? Number(((targetTime - startTime) * 10000n) / duration) / 100
                : 0,
              isCliffPassed: targetTime >= cliffEnd,
              isVestingComplete: targetTime >= vestingEnd,
              canRelease: releasable > 0n,
            },
          });
        } catch (error) {
          console.error(`Error calculating unlock on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching calculation data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      calculationResults,
      totalResults: calculationResults.length,
      timestamp: Date.now(),
    };

    // Cache for 2 minutes
    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain vesting unlock calculator API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate on-chain vesting unlock',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

