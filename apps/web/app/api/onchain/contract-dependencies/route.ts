import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { ContractDependencyRequest, ContractDependencyMap, ContractDependency } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

async function analyzeContractDependencies(
  contractAddress: Address,
  chainId: number,
  depth: number = 0,
  maxDepth: number = 3,
  visited: Set<string> = new Set()
): Promise<ContractDependency[]> {
  if (depth > maxDepth || visited.has(contractAddress.toLowerCase())) {
    return [];
  }

  visited.add(contractAddress.toLowerCase());
  const dependencies: ContractDependency[] = [];

  try {
    const chain = chains[chainId as keyof typeof chains];
    if (!chain) return [];

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const code = await publicClient.getBytecode({ address: contractAddress });
    
    if (!code || code === '0x') {
      return [];
    }

    // Analyze bytecode for contract calls (simplified - would need deeper analysis)
    // This is a placeholder - real implementation would parse bytecode or use source code
    
    // Check for common patterns (this is simplified)
    const isLibrary = code.length < 1000;
    
    if (isLibrary) {
      dependencies.push({
        address: contractAddress,
        type: 'library',
        relationship: 'imports',
        depth,
      });
    }

    // Recursively analyze dependencies (simplified)
    if (depth < maxDepth) {
      // In production, would extract actual contract addresses from bytecode
    }
  } catch (error) {
    console.error(`Error analyzing contract ${contractAddress}:`, error);
  }

  return dependencies;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContractDependencyRequest = await request.json();
    const { contractAddress, chainId, depth = 3 } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
        { status: 400 }
      );
    }

    const dependencies = await analyzeContractDependencies(
      contractAddress as Address,
      chainId,
      0,
      depth
    );

    const map: ContractDependencyMap = {
      contractAddress: contractAddress as Address,
      dependencies,
      totalDependencies: dependencies.length,
      maxDepth: depth,
    };

    return NextResponse.json({
      success: true,
      ...map,
      type: 'contract-dependency-map',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze contract dependencies' },
      { status: 500 }
    );
  }
}



