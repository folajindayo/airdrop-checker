import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Common liquidity lock contract ABIs
const LOCK_ABI = [
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getLocks',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'token', type: 'address' },
          { name: 'owner', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'lockDate', type: 'uint256' },
          { name: 'unlockDate', type: 'uint256' },
        ],
        name: 'locks',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }, { name: 'lockId', type: 'uint256' }],
    name: 'getLock',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'owner', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'lockDate', type: 'uint256' },
      { name: 'unlockDate', type: 'uint256' },
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

/**
 * GET /api/onchain/token-liquidity-lock/[address]
 * Check on-chain token liquidity lock status for a token contract
 * Monitors locked liquidity and unlock schedules
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lockContract = searchParams.get('lockContract');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-liquidity-lock:${normalizedAddress}:${lockContract || 'all'}:${chainId || 'all'}`;
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

    const lockResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        if (lockContract && isValidAddress(lockContract)) {
          try {
            const locks = await publicClient.readContract({
              address: lockContract as `0x${string}`,
              abi: LOCK_ABI,
              functionName: 'getLocks',
              args: [normalizedAddress],
            });

            const currentTime = BigInt(Math.floor(Date.now() / 1000));
            const activeLocks = locks.filter(
              (lock: any) => lock.unlockDate > currentTime
            );
            const expiredLocks = locks.filter(
              (lock: any) => lock.unlockDate <= currentTime
            );

            const totalLocked = activeLocks.reduce(
              (sum: bigint, lock: any) => sum + lock.amount,
              0n
            );

            const nextUnlock = activeLocks.length > 0
              ? activeLocks.reduce((min: bigint, lock: any) =>
                  lock.unlockDate < min ? lock.unlockDate : min,
                activeLocks[0].unlockDate
              )
              : 0n;

            lockResults.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              tokenAddress: normalizedAddress,
              lockContract: lockContract.toLowerCase(),
              totalLocks: locks.length,
              activeLocks: activeLocks.length,
              expiredLocks: expiredLocks.length,
              totalLocked: totalLocked.toString(),
              formattedTotalLocked: formatUnits(totalLocked, 18),
              nextUnlock: nextUnlock.toString(),
              nextUnlockDate: nextUnlock > 0n ? new Date(Number(nextUnlock) * 1000).toISOString() : null,
              isLocked: activeLocks.length > 0,
              locks: locks.map((lock: any) => ({
                id: lock.id.toString(),
                owner: lock.owner,
                amount: lock.amount.toString(),
                formattedAmount: formatUnits(lock.amount, 18),
                lockDate: lock.lockDate.toString(),
                unlockDate: lock.unlockDate.toString(),
                unlockDateISO: new Date(Number(lock.unlockDate) * 1000).toISOString(),
                isActive: lock.unlockDate > currentTime,
              })),
            });
          } catch (error) {
            console.error(`Error reading lock contract on ${chainConfig.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error fetching liquidity lock on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      lockResults,
      totalResults: lockResults.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain liquidity lock API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check on-chain liquidity locks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

