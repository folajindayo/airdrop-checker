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
    const spender = searchParams.get('spender');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-approval-analyzer:${normalizedAddress}:${tokenAddress || 'all'}:${spender || 'all'}:${chainId || 'all'}`;
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

    const approvalResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        if (tokenAddress && isValidAddress(tokenAddress) && spender && isValidAddress(spender)) {
          try {
            const allowance = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [normalizedAddress, spender.toLowerCase() as `0x${string}`],
            });

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

            const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
            const isUnlimited = allowance >= maxUint256 - BigInt(1000);

            approvalResults.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              tokenAddress: tokenAddress.toLowerCase(),
              owner: normalizedAddress,
              spender: spender.toLowerCase(),
              allowance: allowance.toString(),
              formattedAllowance: formatUnits(allowance, decimals),
              balance: balance.toString(),
              formattedBalance: formatUnits(balance, decimals),
              isUnlimited,
              riskLevel: isUnlimited ? 'high' : allowance > balance ? 'medium' : 'low',
            });
          } catch (error) {
            console.error(`Error analyzing approval on ${chainConfig.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error fetching approval data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      approvalResults,
      totalResults: approvalResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain approval analyzer API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze on-chain token approvals',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

