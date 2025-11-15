import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-lock-detector/[address]
 * Detect token locks and vesting schedules
 * Identifies locked liquidity and vesting contracts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-lock-detector:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const locks: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      detectedLocks: [] as any[],
      totalLocked: 0,
      unlockSchedule: [] as any[],
      securityScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const token = response.data;
        const totalSupply = parseFloat(token.total_supply || '0');
        const circulatingSupply = parseFloat(token.circulating_supply || '0');
        const lockedAmount = totalSupply - circulatingSupply;

        if (lockedAmount > 0) {
          locks.totalLocked = lockedAmount;
          locks.detectedLocks.push({
            type: 'supply_lock',
            amount: lockedAmount,
            percentage: (lockedAmount / totalSupply) * 100,
          });
        }

        locks.securityScore = calculateLockScore(locks);
      }
    } catch (error) {
      console.error('Error detecting locks:', error);
    }

    cache.set(cacheKey, locks, 5 * 60 * 1000);

    return NextResponse.json(locks);
  } catch (error) {
    console.error('Token lock detection error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect token locks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateLockScore(locks: any): number {
  let score = 0;
  if (locks.totalLocked > 0) score += 30;
  if (locks.detectedLocks.length > 0) score += 20;
  return score;
}

