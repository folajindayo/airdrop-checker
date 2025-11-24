import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Comprehensive vesting contract ABI
const VESTING_READER_ABI = [
  {
    inputs: [{ name: 'beneficiary', type: 'address' }],
    name: 'getVestingInfo',
    outputs: [
      { name: 'startTime', type: 'uint256' },
      { name: 'cliff', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'released', type: 'uint256' },
      { name: 'releasable', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'beneficiary', type: 'address' }],
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
 * GET /api/onchain/token-vesting-reader/[address]
 * Read comprehensive on-chain token vesting contract data
 * Provides detailed vesting schedule information
 */
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

    if (!vestingContract || !isValidAddress(vestingContract)) {
      return NextResponse.json(
        { error: 'Valid vesting contract address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-vesting-reader:${normalizedAddress}:${vestingContract}:${chainId || 'all'}`;
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

    const vestingData: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          // Try comprehensive vesting info
          let vestingInfo: any = null;
          try {
            const info = await publicClient.readContract({
              address: vestingContract as `0x${string}`,
              abi: VESTING_READER_ABI,
              functionName: 'getVestingInfo',
              args: [normalizedAddress],
            });

            vestingInfo = {
              startTime: info[0].toString(),
              cliff: info[1].toString(),
              duration: info[2].toString(),
              totalAmount: info[3].toString(),
              released: info[4].toString(),
              releasable: info[5].toString(),
            };
          } catch {
            // Function might not exist, try individual calls
          }

          // Get vested amount
          let vestedAmount = 0n;
          try {
            vestedAmount = await publicClient.readContract({
              address: vestingContract as `0x${string}`,
              abi: VESTING_READER_ABI,
              functionName: 'vestedAmount',
              args: [normalizedAddress],
            });
          } catch {
            // Function might not exist
          }

          const currentTime = BigInt(Math.floor(Date.now() / 1000));
          const startTime = vestingInfo ? BigInt(vestingInfo.startTime) : 0n;
          const cliff = vestingInfo ? BigInt(vestingInfo.cliff) : 0n;
          const duration = vestingInfo ? BigInt(vestingInfo.duration) : 0n;
          const totalAmount = vestingInfo ? BigInt(vestingInfo.totalAmount) : 0n;
          const released = vestingInfo ? BigInt(vestingInfo.released) : 0n;
          const releasable = vestingInfo ? BigInt(vestingInfo.releasable) : 0n;

          const cliffEnd = startTime + cliff;
          const vestingEnd = startTime + duration;
          const isCliffPassed = currentTime >= cliffEnd;
          const isVestingComplete = currentTime >= vestingEnd;
          const vestingProgress = duration > 0n && currentTime > startTime
            ? Number(((currentTime - startTime) * 10000n) / duration) / 100
            : 0;

          vestingData.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            vestingContract: vestingContract.toLowerCase(),
            beneficiary: normalizedAddress,
            vestingInfo: vestingInfo || null,
            vestedAmount: vestedAmount.toString(),
            formattedVestedAmount: formatUnits(vestedAmount, 18),
            released: released.toString(),
            formattedReleased: formatUnits(released, 18),
            releasable: releasable.toString(),
            formattedReleasable: formatUnits(releasable, 18),
            totalAmount: totalAmount.toString(),
            formattedTotalAmount: formatUnits(totalAmount, 18),
            schedule: {
              startTime: startTime.toString(),
              startDate: startTime > 0n ? new Date(Number(startTime) * 1000).toISOString() : null,
              cliff: cliff.toString(),
              cliffEnd: cliffEnd.toString(),
              cliffEndDate: cliffEnd > 0n ? new Date(Number(cliffEnd) * 1000).toISOString() : null,
              duration: duration.toString(),
              vestingEnd: vestingEnd.toString(),
              vestingEndDate: vestingEnd > 0n ? new Date(Number(vestingEnd) * 1000).toISOString() : null,
            },
            status: {
              isCliffPassed,
              isVestingComplete,
              vestingProgress: Math.min(100, Math.max(0, vestingProgress)),
              canRelease: releasable > 0n,
            },
          });
        } catch (error) {
          console.error(`Error reading vesting contract on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching vesting data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      vestingData,
      totalResults: vestingData.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain vesting reader API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to read on-chain vesting contract',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

