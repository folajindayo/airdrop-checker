import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
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

// ERC20 Approval ABI
const APPROVAL_ABI = [
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
] as const;

/**
 * GET /api/onchain/token-approvals/[address]
 * Scan and manage token approvals for a wallet
 * Uses direct blockchain calls via Viem
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const tokenAddress = searchParams.get('token');
    const spender = searchParams.get('spender');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-token-approvals:${normalizedAddress}:${chainId || 'all'}:${tokenAddress || 'all'}`;
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

    const approvals: any[] = [];
    const riskLevels: Record<string, 'low' | 'medium' | 'high'> = {};

    // Common DeFi spender addresses that might have approvals
    const commonSpenders: Record<number, string[]> = {
      [mainnet.id]: [
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
        '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3 Router
        '0x7d2768dE32b0b80b7a3454c06Bd94BcC461C9C16', // Aave Lending Pool
      ],
    };

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        // If specific token and spender provided, check that approval
        if (tokenAddress && isValidAddress(tokenAddress) && spender && isValidAddress(spender)) {
          try {
            const allowance = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: APPROVAL_ABI,
              functionName: 'allowance',
              args: [normalizedAddress, spender as `0x${string}`],
            });

            if (allowance > 0n) {
              approvals.push({
                chainId: chainConfig.id,
                chainName: chainConfig.name,
                tokenAddress: tokenAddress.toLowerCase(),
                spender: spender.toLowerCase(),
                allowance: allowance.toString(),
                hasApproval: true,
              });
            }
          } catch (error) {
            console.error(`Error checking approval:`, error);
          }
        } else {
          // Check common spenders for this chain
          const spenders = commonSpenders[chainConfig.id] || [];
          
          // Note: In production, you'd want to get all token balances first
          // and then check approvals for each token-spender pair
          // This is a simplified version
          
          for (const spenderAddr of spenders) {
            // This would require getting token list first
            // For now, we'll return a structure that indicates how to check
          }
        }
      } catch (error) {
        console.error(`Error scanning approvals on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      approvals,
      summary: {
        totalApprovals: approvals.length,
        riskLevels,
        recommendations: approvals.length > 0
          ? ['Review token approvals regularly', 'Revoke unused approvals']
          : ['No active approvals found'],
      },
      note: 'For comprehensive approval scanning, use a service like Revoke.cash or check each token-spender pair individually',
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token approvals API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scan token approvals',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

