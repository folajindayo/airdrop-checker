import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

/**
 * GET /api/onchain/contract-verification/[address]
 * Check if a smart contract is verified on block explorers
 * Uses block explorer APIs
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

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-contract-verification:${normalizedAddress}:${chainId || 'all'}`;
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

    const verifications: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        // Check if address has code (is a contract)
        const code = await publicClient.getBytecode({
          address: normalizedAddress,
        });

        const isContract = code && code !== '0x';

        if (isContract) {
          // Get contract creation info
          const blockExplorerUrl = chainConfig.chain.blockExplorers?.default?.url;
          
          verifications.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            contractAddress: normalizedAddress,
            isContract: true,
            isVerified: null, // Would need block explorer API for this
            blockExplorerUrl: blockExplorerUrl 
              ? `${blockExplorerUrl}/address/${normalizedAddress}`
              : null,
            note: 'Verification status requires block explorer API integration',
          });
        } else {
          verifications.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            contractAddress: normalizedAddress,
            isContract: false,
            isVerified: false,
          });
        }
      } catch (error) {
        console.error(`Error checking contract verification on ${chainConfig.name}:`, error);
        verifications.push({
          chainId: chainConfig.id,
          chainName: chainConfig.name,
          contractAddress: normalizedAddress,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const result = {
      address: normalizedAddress,
      verifications,
      summary: {
        isContract: verifications.some(v => v.isContract),
        verifiedChains: verifications.filter(v => v.isVerified === true).length,
        unverifiedChains: verifications.filter(v => v.isContract && v.isVerified === false).length,
      },
      timestamp: Date.now(),
    };

    // Cache for 1 hour
    cache.set(cacheKey, result, 60 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain contract verification API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check contract verification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

