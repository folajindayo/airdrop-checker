import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { ProxyPatternRequest, ProxyPattern } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: ProxyPatternRequest = await request.json();
    const { contractAddress, chainId } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
        { status: 400 }
      );
    }

    const chain = chains[chainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Check for proxy patterns
    let isProxy = false;
    let proxyType: 'transparent' | 'uups' | 'beacon' | 'minimal' | undefined;
    let implementationAddress: Address | undefined;
    let adminAddress: Address | undefined;

    // Check EIP-1967 implementation slot
    try {
      const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
      const implData = await publicClient.getStorageAt({
        address: contractAddress,
        slot: implSlot,
      });
      
      if (implData && implData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        isProxy = true;
        proxyType = 'uups';
        implementationAddress = `0x${implData.slice(-40)}` as Address;
      }
    } catch {
      // Not UUPS proxy
    }

    // Check admin slot
    if (isProxy) {
      try {
        const adminSlot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
        const adminData = await publicClient.getStorageAt({
          address: contractAddress,
          slot: adminSlot,
        });
        
        if (adminData && adminData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          adminAddress = `0x${adminData.slice(-40)}` as Address;
        }
      } catch {
        // Admin not found
      }
    }

    const hasTimelock = false; // Would need to check timelock contract

    const pattern: ProxyPattern = {
      contractAddress,
      isProxy,
      proxyType,
      implementationAddress,
      adminAddress,
      hasTimelock,
    };

    return NextResponse.json({
      success: true,
      ...pattern,
      type: 'proxy-pattern',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to detect proxy pattern' },
      { status: 500 }
    );
  }
}


