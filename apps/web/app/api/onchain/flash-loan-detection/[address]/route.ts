import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Common flash loan provider addresses
const FLASH_LOAN_PROVIDERS = {
  [mainnet.id]: [
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2 Router
    '0xe592427a0aece92de3edee1f18e0157c05861564', // Uniswap V3 Router
    '0x881d40237659c251811cec9c364ef91dc08d300c', // Aave
    '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', // Aave Lending Pool
  ],
  [base.id]: [
    '0x2626664c2603336e57b271c5c0b26f421741e481', // Base Uniswap V3
  ],
  [arbitrum.id]: [
    '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // Arbitrum Uniswap V3
  ],
};

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

/**
 * GET /api/onchain/flash-loan-detection/[address]
 * Detect on-chain flash loan usage for a wallet address
 * Analyzes transaction patterns to identify flash loan activity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const txHash = searchParams.get('txHash');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-flash-loan:${normalizedAddress}:${txHash || 'all'}:${chainId || 'all'}`;
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

    const detectionResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        if (txHash) {
          try {
            const tx = await publicClient.getTransaction({
              hash: txHash as `0x${string}`,
            });

            const receipt = await publicClient.getTransactionReceipt({
              hash: txHash as `0x${string}`,
            });

            // Check if transaction interacts with known flash loan providers
            const providers = FLASH_LOAN_PROVIDERS[chainConfig.id as keyof typeof FLASH_LOAN_PROVIDERS] || [];
            const interactedProviders = providers.filter((provider) =>
              receipt.logs.some((log) => log.address.toLowerCase() === provider.toLowerCase())
            );

            // Flash loan indicators: single transaction, multiple token transfers, same block
            const isFlashLoanCandidate =
              interactedProviders.length > 0 ||
              receipt.logs.length > 10 ||
              (tx.to && providers.includes(tx.to.toLowerCase()));

            detectionResults.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              address: normalizedAddress,
              txHash,
              isFlashLoanCandidate,
              interactedProviders: interactedProviders.map((p) => p.toLowerCase()),
              indicators: {
                hasProviderInteraction: interactedProviders.length > 0,
                highLogCount: receipt.logs.length > 10,
                sameBlockExecution: true,
              },
              transaction: {
                from: tx.from,
                to: tx.to,
                value: tx.value.toString(),
                gasUsed: receipt.gasUsed.toString(),
                status: receipt.status,
              },
            });
          } catch (error) {
            console.error(`Error analyzing transaction on ${chainConfig.name}:`, error);
          }
        } else {
          // General flash loan detection for address
          const providers = FLASH_LOAN_PROVIDERS[chainConfig.id as keyof typeof FLASH_LOAN_PROVIDERS] || [];
          detectionResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            address: normalizedAddress,
            knownProviders: providers,
            note: 'Provide txHash parameter for specific transaction analysis',
          });
        }
      } catch (error) {
        console.error(`Error detecting flash loans on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      detectionResults,
      totalResults: detectionResults.length,
      timestamp: Date.now(),
    };

    // Cache for 2 minutes
    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain flash loan detection API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect on-chain flash loans',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

