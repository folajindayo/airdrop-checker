import { NextRequest, NextResponse } from 'next/server';
import { formatUnits, Address, erc20Abi } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon, zkSync } from 'viem/chains';
import type { CrossChainBalanceRequest, CrossChainBalanceResponse, ChainBalance } from '@/lib/onchain/types';
import { aggregateCrossChainBalances, formatAggregatedBalance, getChainName } from '@/lib/onchain/helpers';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
  324: zkSync,
} as const;

async function getBalanceForChain(
  address: Address,
  chainId: number,
  tokenAddress?: Address
): Promise<ChainBalance> {
  const chain = chains[chainId as keyof typeof chains];
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  if (tokenAddress) {
    // ERC20 token balance
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    });

    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    });

    const symbol = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'symbol',
    }).catch(() => 'TOKEN');

    return {
      chainId,
      chainName: getChainName(chainId),
      balance: balance.toString(),
      balanceFormatted: formatUnits(balance, decimals),
      tokenAddress,
      tokenSymbol: symbol,
      decimals: Number(decimals),
    };
  } else {
    // Native token balance
    const balance = await publicClient.getBalance({
      address,
    });

    return {
      chainId,
      chainName: getChainName(chainId),
      balance: balance.toString(),
      balanceFormatted: formatUnits(balance, 18),
      decimals: 18,
      tokenSymbol: chain.nativeCurrency.symbol,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CrossChainBalanceRequest = await request.json();
    const { address, tokenAddress, chainIds } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    if (!chainIds || chainIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: chainIds' },
        { status: 400 }
      );
    }

    // Fetch balances from all chains in parallel
    const balancePromises = chainIds.map(chainId =>
      getBalanceForChain(address as Address, chainId, tokenAddress as Address | undefined)
        .catch(error => {
          console.error(`Error fetching balance for chain ${chainId}:`, error);
          return null;
        })
    );

    const balances = (await Promise.all(balancePromises)).filter(
      (balance): balance is ChainBalance => balance !== null
    );

    const totalBalance = aggregateCrossChainBalances(balances);
    const decimals = balances[0]?.decimals || 18;
    const totalBalanceFormatted = formatAggregatedBalance(totalBalance, decimals);

    const response: CrossChainBalanceResponse = {
      address: address as Address,
      totalBalance,
      totalBalanceFormatted,
      balances,
      chainCount: balances.length,
      tokenAddress: tokenAddress as Address | undefined,
    };

    return NextResponse.json({
      success: true,
      ...response,
      type: 'cross-chain-balance',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate cross-chain balances' },
      { status: 500 }
    );
  }
}


