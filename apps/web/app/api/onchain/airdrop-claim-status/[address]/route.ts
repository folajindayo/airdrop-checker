import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Airdrop claim status ABI
const CLAIM_STATUS_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'claimableAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasClaimed',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'claimedAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimDeadline',
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
 * GET /api/onchain/airdrop-claim-status/[address]
 * Get on-chain airdrop claim status for a wallet address
 * Provides comprehensive claim status and eligibility information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const claimContract = searchParams.get('contract');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!claimContract || !isValidAddress(claimContract)) {
      return NextResponse.json(
        { error: 'Valid claim contract address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-claim-status:${normalizedAddress}:${claimContract}:${chainId || 'all'}`;
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

    const claimStatusResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const [claimableAmount, hasClaimed, claimedAmount, claimDeadline] = await Promise.all([
            publicClient.readContract({
              address: claimContract as `0x${string}`,
              abi: CLAIM_STATUS_ABI,
              functionName: 'claimableAmount',
              args: [normalizedAddress],
            }).catch(() => 0n),
            publicClient.readContract({
              address: claimContract as `0x${string}`,
              abi: CLAIM_STATUS_ABI,
              functionName: 'hasClaimed',
              args: [normalizedAddress],
            }).catch(() => false),
            publicClient.readContract({
              address: claimContract as `0x${string}`,
              abi: CLAIM_STATUS_ABI,
              functionName: 'claimedAmount',
              args: [normalizedAddress],
            }).catch(() => 0n),
            publicClient.readContract({
              address: claimContract as `0x${string}`,
              abi: CLAIM_STATUS_ABI,
              functionName: 'claimDeadline',
            }).catch(() => 0n),
          ]);

          const currentTime = BigInt(Math.floor(Date.now() / 1000));
          const isDeadlinePassed = claimDeadline > 0n && currentTime > claimDeadline;
          const canClaim = claimableAmount > 0n && !hasClaimed && !isDeadlinePassed;

          claimStatusResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            claimContract: claimContract.toLowerCase(),
            address: normalizedAddress,
            status: {
              isEligible: claimableAmount > 0n,
              hasClaimed: Boolean(hasClaimed),
              canClaim,
              isDeadlinePassed,
            },
            amounts: {
              claimable: claimableAmount.toString(),
              formattedClaimable: formatUnits(claimableAmount, 18),
              claimed: claimedAmount.toString(),
              formattedClaimed: formatUnits(claimedAmount, 18),
              total: (claimableAmount + claimedAmount).toString(),
              formattedTotal: formatUnits(claimableAmount + claimedAmount, 18),
            },
            deadline: {
              deadline: claimDeadline.toString(),
              deadlineDate: claimDeadline > 0n
                ? new Date(Number(claimDeadline) * 1000).toISOString()
                : null,
              daysRemaining: claimDeadline > 0n && !isDeadlinePassed
                ? Math.floor(Number(claimDeadline - currentTime) / 86400)
                : 0,
              isDeadlinePassed,
            },
            analysis: {
              claimStatus: hasClaimed
                ? 'Claimed'
                : isDeadlinePassed
                ? 'Deadline Passed'
                : claimableAmount > 0n
                ? 'Available to Claim'
                : 'Not Eligible',
              action: canClaim ? 'Can Claim Now' : hasClaimed ? 'Already Claimed' : 'Cannot Claim',
            },
          });
        } catch (error) {
          console.error(`Error reading claim status on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching claim status on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      claimStatusResults,
      totalResults: claimStatusResults.length,
      timestamp: Date.now(),
    };

    // Cache for 2 minutes
    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain airdrop claim status API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch on-chain airdrop claim status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

