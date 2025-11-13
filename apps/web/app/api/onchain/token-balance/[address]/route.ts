import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { erc20Abi } from 'viem';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
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
 * GET /api/onchain/token-balance/[address]
 * Get on-chain ERC20 token balances for a wallet address
 * Uses direct blockchain calls via Viem
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const tokenAddress = searchParams.get('token');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-token-balance:${normalizedAddress}:${tokenAddress || 'all'}:${chainId || 'all'}`;
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

    const balances: any[] = [];

    // If specific token address provided, check balance on all chains
    if (tokenAddress && isValidAddress(tokenAddress)) {
      for (const chainConfig of targetChains) {
        try {
          const publicClient = createPublicClient({
            chain: chainConfig.chain,
            transport: http(),
          });

          const balance = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [normalizedAddress],
          });

          // Get token decimals
          let decimals = 18;
          try {
            const decimalsResult = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: 'decimals',
            });
            decimals = Number(decimalsResult);
          } catch {
            // Default to 18 if decimals call fails
          }

          const formattedBalance = formatUnits(balance, decimals);

          balances.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: tokenAddress.toLowerCase(),
            balance: balance.toString(),
            formattedBalance,
            decimals,
          });
        } catch (error) {
          console.error(`Error fetching balance on ${chainConfig.name}:`, error);
        }
      }
    } else {
      // Get native token balance for all chains
      for (const chainConfig of targetChains) {
        try {
          const publicClient = createPublicClient({
            chain: chainConfig.chain,
            transport: http(),
          });

          const balance = await publicClient.getBalance({
            address: normalizedAddress,
          });

          balances.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: 'native',
            balance: balance.toString(),
            formattedBalance: formatUnits(balance, 18),
            decimals: 18,
            isNative: true,
          });
        } catch (error) {
          console.error(`Error fetching native balance on ${chainConfig.name}:`, error);
        }
      }
    }

    const result = {
      address: normalizedAddress,
      balances,
      totalChains: balances.length,
      timestamp: Date.now(),
    };

    // Cache for 1 minute
    cache.set(cacheKey, result, 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token balance API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch on-chain token balances',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

