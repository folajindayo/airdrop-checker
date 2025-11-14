import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

const AIRDROP_CLAIM_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'isEligible',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'claimableAmount',
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
    const cacheKey = `onchain-claim-eligibility:${normalizedAddress}:${claimContract}:${chainId || 'all'}`;
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

    const eligibilityResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const isEligible = await publicClient.readContract({
            address: claimContract as `0x${string}`,
            abi: AIRDROP_CLAIM_ABI,
            functionName: 'isEligible',
            args: [normalizedAddress],
          });

          const claimableAmount = await publicClient.readContract({
            address: claimContract as `0x${string}`,
            abi: AIRDROP_CLAIM_ABI,
            functionName: 'claimableAmount',
            args: [normalizedAddress],
          });

          eligibilityResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            claimContract: claimContract.toLowerCase(),
            address: normalizedAddress,
            isEligible: Boolean(isEligible),
            claimableAmount: claimableAmount.toString(),
            formattedClaimableAmount: formatUnits(claimableAmount, 18),
          });
        } catch (error) {
          console.error(`Error reading claim contract on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching claim eligibility on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      eligibilityResults,
      totalResults: eligibilityResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain claim eligibility API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch on-chain claim eligibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

