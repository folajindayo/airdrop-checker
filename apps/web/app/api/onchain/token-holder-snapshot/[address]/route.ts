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

/**
 * GET /api/onchain/token-holder-snapshot/[address]
 * Generate on-chain token holder snapshot for a token contract
 * Creates snapshot of holder balances at a specific block
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const blockNumber = searchParams.get('blockNumber');
    const holderAddresses = searchParams.get('holders')?.split(',');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!holderAddresses || holderAddresses.length === 0) {
      return NextResponse.json(
        { error: 'At least one holder address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-snapshot:${normalizedAddress}:${blockNumber || 'latest'}:${holderAddresses.join(',')}:${chainId || 'all'}`;
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

    const snapshotResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          // Get total supply
          const totalSupply = await publicClient.readContract({
            address: normalizedAddress,
            abi: erc20Abi,
            functionName: 'totalSupply',
            blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
          });

          // Get decimals
          let decimals = 18;
          try {
            const decimalsResult = await publicClient.readContract({
              address: normalizedAddress,
              abi: erc20Abi,
              functionName: 'decimals',
              blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
            });
            decimals = Number(decimalsResult);
          } catch {
            // Default to 18
          }

          // Get block info
          const currentBlock = blockNumber
            ? BigInt(blockNumber)
            : await publicClient.getBlockNumber();
          const block = await publicClient.getBlock({ blockNumber: currentBlock });

          // Get balances for all holders
          const holders: any[] = [];
          for (const holder of holderAddresses) {
            if (isValidAddress(holder)) {
              try {
                const balance = await publicClient.readContract({
                  address: normalizedAddress,
                  abi: erc20Abi,
                  functionName: 'balanceOf',
                  args: [holder.toLowerCase() as `0x${string}`],
                  blockNumber: currentBlock,
                });

                const percentage = totalSupply > 0n
                  ? Number((balance * 10000n) / totalSupply) / 100
                  : 0;

                holders.push({
                  address: holder.toLowerCase(),
                  balance: balance.toString(),
                  formattedBalance: formatUnits(balance, decimals),
                  percentage,
                });
              } catch (error) {
                console.error(`Error fetching balance for ${holder}:`, error);
              }
            }
          }

          // Sort by balance
          const sortedHolders = holders.sort(
            (a, b) => Number(b.balance) - Number(a.balance)
          );

          const totalSnapshotBalance = holders.reduce(
            (sum, h) => sum + BigInt(h.balance),
            0n
          );

          snapshotResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: normalizedAddress,
            snapshot: {
              blockNumber: currentBlock.toString(),
              timestamp: block.timestamp,
              date: new Date(Number(block.timestamp) * 1000).toISOString(),
              totalSupply: totalSupply.toString(),
              formattedTotalSupply: formatUnits(totalSupply, decimals),
              totalSnapshotBalance: totalSnapshotBalance.toString(),
              formattedTotalSnapshotBalance: formatUnits(totalSnapshotBalance, decimals),
              holdersCount: holders.length,
              holders: sortedHolders,
            },
            decimals,
          });
        } catch (error) {
          console.error(`Error generating snapshot on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching snapshot data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      snapshotResults,
      totalResults: snapshotResults.length,
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token holder snapshot API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate on-chain token holder snapshot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

