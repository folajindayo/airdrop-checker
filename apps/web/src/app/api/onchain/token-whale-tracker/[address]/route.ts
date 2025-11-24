import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { erc20Abi } from 'viem';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

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
    const tokenAddress = searchParams.get('token');
    const threshold = searchParams.get('threshold') || '1000000';
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!tokenAddress || !isValidAddress(tokenAddress)) {
      return NextResponse.json(
        { error: 'Valid token address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-whale-tracker:${normalizedAddress}:${tokenAddress}:${threshold}:${chainId || 'all'}`;
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

    const whaleResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const balance = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [normalizedAddress],
          });

          let decimals = 18;
          try {
            const decimalsResult = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: 'decimals',
            });
            decimals = Number(decimalsResult);
          } catch {
            // Default to 18
          }

          const formattedBalance = formatUnits(balance, decimals);
          const isWhale = parseFloat(formattedBalance) >= parseFloat(threshold);

          whaleResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: tokenAddress.toLowerCase(),
            holderAddress: normalizedAddress,
            balance: balance.toString(),
            formattedBalance,
            threshold: threshold,
            isWhale,
          });
        } catch (error) {
          console.error(`Error tracking whale on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching whale data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      whaleResults,
      totalResults: whaleResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain whale tracker API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track on-chain token whales',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

