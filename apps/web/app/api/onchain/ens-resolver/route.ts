import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// ENS Registry and Resolver ABIs
const ENS_REGISTRY_ABI = [
  {
    inputs: [{ name: 'name', type: 'bytes32' }],
    name: 'resolver',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
] as const;

const ENS_RESOLVER_ABI = [
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'addr',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
] as const;

const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as const;
const ENS_REGISTRY_ABI_FULL = [
  {
    inputs: [{ name: 'name', type: 'bytes32' }],
    name: 'resolver',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
] as const;

/**
 * GET /api/onchain/ens-resolver
 * Resolve ENS names to addresses and vice versa
 * Uses direct blockchain calls via Viem
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const address = searchParams.get('address');

    if (!name && !address) {
      return NextResponse.json(
        { error: 'Either name or address parameter is required' },
        { status: 400 }
      );
    }

    if (address && !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const cacheKey = `onchain-ens-resolver:${name || address}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    let result: any = {};

    // Resolve ENS name to address
    if (name) {
      try {
        // Convert name to node hash (simplified - in production use proper namehash)
        // For now, we'll use a library approach or direct call
        // Note: This is a simplified version - full ENS resolution requires namehash
        
        // Using public client's built-in ENS resolution if available
        const resolvedAddress = await publicClient.getEnsAddress({
          name: name.endsWith('.eth') ? name : `${name}.eth`,
        });

        result = {
          name: name.endsWith('.eth') ? name : `${name}.eth`,
          address: resolvedAddress,
          resolved: !!resolvedAddress,
        };
      } catch (error) {
        result = {
          name: name.endsWith('.eth') ? name : `${name}.eth`,
          address: null,
          resolved: false,
          error: error instanceof Error ? error.message : 'Failed to resolve',
        };
      }
    }

    // Reverse resolve address to ENS name
    if (address) {
      try {
        const normalizedAddress = address.toLowerCase() as `0x${string}`;
        const ensName = await publicClient.getEnsName({
          address: normalizedAddress,
        });

        result = {
          ...result,
          address: normalizedAddress,
          name: ensName,
          reverseResolved: !!ensName,
        };
      } catch (error) {
        result = {
          ...result,
          address: address.toLowerCase(),
          name: null,
          reverseResolved: false,
          error: error instanceof Error ? error.message : 'Failed to reverse resolve',
        };
      }
    }

    result.timestamp = Date.now();

    // Cache for 1 hour (ENS data doesn't change frequently)
    cache.set(cacheKey, result, 60 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain ENS resolver API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to resolve ENS',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

