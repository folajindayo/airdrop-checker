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

// Common multi-sig wallet factory addresses
const MULTISIG_FACTORIES: Record<number, string[]> = {
  [mainnet.id]: [
    '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2', // Gnosis Safe Factory
    '0x12302fE9c02ff50939BaAaaf415fc226C078613C', // Gnosis Safe Factory v1.1.1
  ],
};

/**
 * GET /api/onchain/multisig-detector/[address]
 * Detect if an address is a multi-sig wallet
 * Uses direct blockchain calls via Viem
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-multisig-detector:${normalizedAddress}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    // Gnosis Safe ABI (simplified)
    const GNOSIS_SAFE_ABI = [
      {
        inputs: [],
        name: 'getOwners',
        outputs: [{ name: '', type: 'address[]' }],
        type: 'function',
      },
      {
        inputs: [],
        name: 'getThreshold',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
      },
      {
        inputs: [],
        name: 'getNonce',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
      },
    ] as const;

    let isMultisig = false;
    let multisigInfo: any = null;

    for (const chainConfig of chains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        // Try to read Gnosis Safe contract methods
        try {
          const [owners, threshold, nonce] = await Promise.all([
            publicClient.readContract({
              address: normalizedAddress,
              abi: GNOSIS_SAFE_ABI,
              functionName: 'getOwners',
            }).catch(() => null),
            publicClient.readContract({
              address: normalizedAddress,
              abi: GNOSIS_SAFE_ABI,
              functionName: 'getThreshold',
            }).catch(() => null),
            publicClient.readContract({
              address: normalizedAddress,
              abi: GNOSIS_SAFE_ABI,
              functionName: 'getNonce',
            }).catch(() => null),
          ]);

          if (owners && threshold !== null) {
            isMultisig = true;
            multisigInfo = {
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              type: 'Gnosis Safe',
              owners: owners.map((addr: string) => addr.toLowerCase()),
              threshold: Number(threshold),
              nonce: nonce ? Number(nonce) : null,
              ownerCount: owners.length,
              confirmationRequired: Number(threshold),
            };
            break; // Found multisig, no need to check other chains
          }
        } catch {
          // Not a Gnosis Safe on this chain, continue
        }

        // Check if address matches known multisig factory patterns
        const factories = MULTISIG_FACTORIES[chainConfig.id] || [];
        for (const factory of factories) {
          // In production, you'd check if this address was created by the factory
          // This is a simplified check
        }
      } catch (error) {
        console.error(`Error checking multisig on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      isMultisig,
      multisigInfo,
      detectionMethod: isMultisig ? 'contract_call' : 'not_detected',
      timestamp: Date.now(),
    };

    // Cache for 1 hour (multisig status doesn't change)
    cache.set(cacheKey, result, 60 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain multisig detector API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect multisig wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

