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
 * GET /api/onchain/contract-code-analyzer/[address]
 * Analyze on-chain smart contract code and bytecode
 * Provides contract verification status and bytecode analysis
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
    const cacheKey = `onchain-contract-code:${normalizedAddress}:${chainId || 'all'}`;
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

    const analysisResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const bytecode = await publicClient.getBytecode({
            address: normalizedAddress,
          });

          const codeSize = bytecode ? bytecode.length : 0;
          const isContract = bytecode && bytecode !== '0x' && bytecode.length > 2;
          const isProxy = bytecode ? bytecode.includes('363d3d373d3d3d363d73') : false;
          const hasDelegateCall = bytecode ? bytecode.includes('f4') : false;
          const hasSelfDestruct = bytecode ? bytecode.includes('ff') : false;

          // Analyze bytecode patterns
          const patterns = {
            hasERC20: bytecode ? bytecode.includes('18160ddd') || bytecode.includes('70a08231') : false,
            hasERC721: bytecode ? bytecode.includes('80ac58cd') || bytecode.includes('6352211e') : false,
            hasERC1155: bytecode ? bytecode.includes('00fdd58e') || bytecode.includes('4e1273f4') : false,
            hasPausable: bytecode ? bytecode.includes('8456cb59') : false,
            hasOwnable: bytecode ? bytecode.includes('8da5cb5b') : false,
            hasReentrancyGuard: bytecode ? bytecode.includes('5c60da1b') : false,
          };

          analysisResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            contractAddress: normalizedAddress,
            isContract,
            codeSize,
            bytecodeLength: bytecode ? bytecode.length : 0,
            isProxy,
            hasDelegateCall,
            hasSelfDestruct,
            patterns,
            analysis: {
              contractType: patterns.hasERC1155
                ? 'ERC1155'
                : patterns.hasERC721
                ? 'ERC721'
                : patterns.hasERC20
                ? 'ERC20'
                : 'Unknown',
              securityFeatures: {
                hasPausable: patterns.hasPausable,
                hasOwnable: patterns.hasOwnable,
                hasReentrancyGuard: patterns.hasReentrancyGuard,
              },
              riskLevel: hasSelfDestruct ? 'high' : hasDelegateCall ? 'medium' : 'low',
            },
          });
        } catch (error) {
          console.error(`Error analyzing contract on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching contract code on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      analysisResults,
      totalResults: analysisResults.length,
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain contract code analyzer API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze on-chain contract code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

