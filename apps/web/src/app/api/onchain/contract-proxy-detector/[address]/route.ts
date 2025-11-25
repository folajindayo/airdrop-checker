import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { isValidAddress } from '@airdrop-finder/shared';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

export const dynamic = 'force-dynamic';

// EIP-1967 storage slots for proxy detection
const PROXY_SLOTS = {
  IMPLEMENTATION: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  BEACON: '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50',
  ADMIN: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103',
};

// Proxy bytecode patterns
const PROXY_PATTERNS = {
  EIP1967: '363d3d373d3d3d363d73',
  UUPS: '5f5f365f5f37f5f3af43f5f3',
  TRANSPARENT: '608060405234801561001057600080fd5b50',
};

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

/**
 * GET /api/onchain/contract-proxy-detector/[address]
 * Detect on-chain contract proxy patterns and implementation addresses
 * Identifies EIP-1967, UUPS, and transparent proxy patterns
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
    const cacheKey = `onchain-proxy-detector:${normalizedAddress}:${chainId || 'all'}`;
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

    const proxyResults: any[] = [];

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

          const isContract = bytecode && bytecode !== '0x' && bytecode.length > 2;
          
          // Check bytecode patterns
          const hasEIP1967Pattern = bytecode ? bytecode.includes(PROXY_PATTERNS.EIP1967) : false;
          const hasUUPSPattern = bytecode ? bytecode.includes(PROXY_PATTERNS.UUPS) : false;
          const hasTransparentPattern = bytecode ? bytecode.includes(PROXY_PATTERNS.TRANSPARENT) : false;

          // Read storage slots
          let implementationAddress: string | null = null;
          let beaconAddress: string | null = null;
          let adminAddress: string | null = null;

          if (isContract) {
            try {
              const implSlot = await publicClient.getStorageAt({
                address: normalizedAddress,
                slot: PROXY_SLOTS.IMPLEMENTATION,
              });

              if (implSlot && implSlot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                implementationAddress = '0x' + implSlot.slice(-40).toLowerCase();
              }

              const beaconSlot = await publicClient.getStorageAt({
                address: normalizedAddress,
                slot: PROXY_SLOTS.BEACON,
              });

              if (beaconSlot && beaconSlot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                beaconAddress = '0x' + beaconSlot.slice(-40).toLowerCase();
              }

              const adminSlot = await publicClient.getStorageAt({
                address: normalizedAddress,
                slot: PROXY_SLOTS.ADMIN,
              });

              if (adminSlot && adminSlot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                adminAddress = '0x' + adminSlot.slice(-40).toLowerCase();
              }
            } catch (error) {
              console.error(`Error reading storage slots:`, error);
            }
          }

          // Determine proxy type
          let proxyType = 'Not a Proxy';
          if (implementationAddress) {
            proxyType = 'EIP-1967 Proxy';
          } else if (beaconAddress) {
            proxyType = 'Beacon Proxy';
          } else if (hasUUPSPattern) {
            proxyType = 'UUPS Proxy';
          } else if (hasTransparentPattern) {
            proxyType = 'Transparent Proxy';
          } else if (hasEIP1967Pattern) {
            proxyType = 'Possible Proxy (Pattern Detected)';
          }

          proxyResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            contractAddress: normalizedAddress,
            isContract,
            isProxy: implementationAddress !== null || beaconAddress !== null || hasEIP1967Pattern || hasUUPSPattern || hasTransparentPattern,
            proxyType,
            implementationAddress,
            beaconAddress,
            adminAddress,
            patterns: {
              hasEIP1967Pattern,
              hasUUPSPattern,
              hasTransparentPattern,
            },
            analysis: {
              upgradeable: implementationAddress !== null || beaconAddress !== null,
              proxyStandard: implementationAddress ? 'EIP-1967' : beaconAddress ? 'Beacon' : 'Unknown',
              riskLevel: adminAddress ? 'medium' : implementationAddress ? 'low' : 'none',
            },
          });
        } catch (error) {
          console.error(`Error detecting proxy on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching proxy data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      proxyResults,
      totalResults: proxyResults.length,
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain contract proxy detector API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect on-chain contract proxy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

