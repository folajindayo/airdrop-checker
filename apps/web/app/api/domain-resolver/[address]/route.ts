import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

interface ENSResolution {
  address: string;
  ensName: string | null;
  avatar: string | null;
  resolver: string | null;
  reverseRecord: boolean;
}

interface DomainResolution {
  address: string;
  domain: string | null;
  provider: 'ens' | 'unstoppable' | 'none';
}

interface DomainResolverResponse {
  address: string;
  ens: ENSResolution | null;
  domains: DomainResolution[];
  primaryDomain: string | null;
  timestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour (ENS doesn't change often)
const cache = new Map<string, { data: DomainResolverResponse; expires: number }>();

// Create public client for Ethereum mainnet
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `domain-resolver:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const addressLower = address.toLowerCase();
    let ensName: string | null = null;
    let avatar: string | null = null;
    let resolver: string | null = null;

    // Resolve ENS name (reverse lookup)
    try {
      ensName = await publicClient.getEnsName({
        address: addressLower as `0x${string}`,
      });

      if (ensName) {
        // Get ENS avatar
        try {
          avatar = await publicClient.getEnsAvatar({
            name: ensName,
          });
        } catch (error) {
          // Avatar is optional
        }

        // Get resolver address
        try {
          resolver = await publicClient.getEnsResolver({
            name: ensName,
          });
        } catch (error) {
          // Resolver is optional
        }
      }
    } catch (error) {
      console.error('Error resolving ENS:', error);
    }

    const ens: ENSResolution | null = ensName ? {
      address: addressLower,
      ensName,
      avatar,
      resolver: resolver || null,
      reverseRecord: true,
    } : null;

    const domains: DomainResolution[] = [];
    if (ensName) {
      domains.push({
        address: addressLower,
        domain: ensName,
        provider: 'ens',
      });
    }

    const result: DomainResolverResponse = {
      address: addressLower,
      ens,
      domains,
      primaryDomain: ensName,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error resolving domain:', error);
    return NextResponse.json(
      { error: 'Failed to resolve domain', details: error.message },
      { status: 500 }
    );
  }
}

