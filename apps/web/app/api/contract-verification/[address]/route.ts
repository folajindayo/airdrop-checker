import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface ContractVerification {
  chainId: number;
  chainName: string;
  contractAddress: string;
  contractName: string;
  isVerified: boolean;
  verificationStatus: 'verified' | 'unverified' | 'unknown';
  compilerVersion?: string;
  sourceCode?: string;
  abi?: any;
  interactionCount: number;
}

interface ContractVerificationResponse {
  address: string;
  totalContracts: number;
  verifiedContracts: number;
  unverifiedContracts: number;
  contracts: ContractVerification[];
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    verified: number;
    unverified: number;
    contracts: ContractVerification[];
  }>;
  timestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, { data: ContractVerificationResponse; expires: number }>();

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
    const cacheKey = `contract-verification:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const contractMap: Record<string, ContractVerification> = {};

    // Fetch contract interactions from all chains
    for (const chain of CHAINS) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        const response = await goldrushClient.get(
          `/v2/${chainName}/address/${address}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          for (const tx of response.data.items) {
            if (tx.to_address && tx.log_events && tx.log_events.length > 0) {
              const contractAddr = tx.to_address.toLowerCase();
              const key = `${chain.id}:${contractAddr}`;
              
              if (!contractMap[key]) {
                // Check if contract has source code (indicates verification)
                const hasSourceCode = tx.log_events.some((log: any) => 
                  log.sender_contract_label && log.sender_contract_label !== 'Unknown'
                );

                contractMap[key] = {
                  chainId: chain.id,
                  chainName: chain.name,
                  contractAddress: contractAddr,
                  contractName: tx.to_address_label || 'Unknown Contract',
                  isVerified: hasSourceCode, // Simplified check
                  verificationStatus: hasSourceCode ? 'verified' : 'unverified',
                  interactionCount: 0,
                };
              }

              contractMap[key].interactionCount++;
            }
          }
        }
      } catch (error) {
        console.error(`Error checking contract verification for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    const contracts = Object.values(contractMap);
    const verifiedCount = contracts.filter(c => c.isVerified).length;
    const unverifiedCount = contracts.filter(c => !c.isVerified).length;

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const contract of contracts) {
      const chainKey = contract.chainName;
      if (!byChain[chainKey]) {
        byChain[chainKey] = {
          chainId: contract.chainId,
          chainName: contract.chainName,
          verified: 0,
          unverified: 0,
          contracts: [],
        };
      }
      if (contract.isVerified) {
        byChain[chainKey].verified++;
      } else {
        byChain[chainKey].unverified++;
      }
      byChain[chainKey].contracts.push(contract);
    }

    const result: ContractVerificationResponse = {
      address: address.toLowerCase(),
      totalContracts: contracts.length,
      verifiedContracts: verifiedCount,
      unverifiedContracts: unverifiedCount,
      contracts: contracts.sort((a, b) => b.interactionCount - a.interactionCount),
      byChain,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error checking contract verification:', error);
    return NextResponse.json(
      { error: 'Failed to check contract verification', details: error.message },
      { status: 500 }
    );
  }
}

