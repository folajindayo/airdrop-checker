import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { isValidAddress } from '@airdrop-finder/shared';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

export const dynamic = 'force-dynamic';

// Proxy patterns and upgradeable contract ABIs
const PROXY_PATTERNS = {
  EIP1967: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', // implementation slot
  EIP1967_BEACON: '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50', // beacon slot
  EIP1967_ADMIN: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103', // admin slot
  UUPS: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
};

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

/**
 * GET /api/onchain/contract-upgrade-detector/[address]
 * Detect on-chain contract upgrade mechanisms and proxy patterns
 * Identifies upgradeable contracts and their implementation addresses
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
    const cacheKey = `onchain-upgrade-detector:${normalizedAddress}:${chainId || 'all'}`;
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

    const upgradeResults: any[] = [];

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
          const isProxy = bytecode ? bytecode.includes('363d3d373d3d3d363d73') : false;

          // Check for EIP-1967 storage slots
          let implementationAddress: string | null = null;
          let adminAddress: string | null = null;
          let beaconAddress: string | null = null;

          if (isProxy) {
            try {
              // Read implementation slot (EIP-1967)
              const implSlot = await publicClient.getStorageAt({
                address: normalizedAddress,
                slot: PROXY_PATTERNS.EIP1967,
              });

              if (implSlot && implSlot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                implementationAddress = '0x' + implSlot.slice(-40);
              }

              // Read admin slot
              const adminSlot = await publicClient.getStorageAt({
                address: normalizedAddress,
                slot: PROXY_PATTERNS.EIP1967_ADMIN,
              });

              if (adminSlot && adminSlot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                adminAddress = '0x' + adminSlot.slice(-40);
              }

              // Read beacon slot
              const beaconSlot = await publicClient.getStorageAt({
                address: normalizedAddress,
                slot: PROXY_PATTERNS.EIP1967_BEACON,
              });

              if (beaconSlot && beaconSlot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                beaconAddress = '0x' + beaconSlot.slice(-40);
              }
            } catch (error) {
              console.error(`Error reading storage slots:`, error);
            }
          }

          upgradeResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            contractAddress: normalizedAddress,
            isContract,
            isProxy,
            isUpgradeable: isProxy || implementationAddress !== null,
            proxyType: implementationAddress ? 'EIP1967' : beaconAddress ? 'Beacon' : isProxy ? 'Unknown Proxy' : 'Not Proxy',
            implementationAddress,
            adminAddress,
            beaconAddress,
            analysis: {
              canBeUpgraded: isProxy || implementationAddress !== null,
              upgradeRisk: isProxy ? (adminAddress ? 'medium' : 'low') : 'none',
              proxyPattern: isProxy ? 'Detected' : 'None',
            },
          });
        } catch (error) {
          console.error(`Error detecting upgrades on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching upgrade data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      upgradeResults,
      totalResults: upgradeResults.length,
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain contract upgrade detector API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect on-chain contract upgrades',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

