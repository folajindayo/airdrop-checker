import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface ContractInteraction {
  chainId: number;
  chainName: string;
  contractAddress: string;
  contractName: string;
  interactionCount: number;
  firstInteraction: string;
  lastInteraction: string;
  functionCalls: Record<string, number>;
  totalValueUSD: number;
  isVerified: boolean;
}

interface ContractInteractionsResponse {
  address: string;
  totalContracts: number;
  totalInteractions: number;
  interactions: ContractInteraction[];
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    contractCount: number;
    interactionCount: number;
    contracts: ContractInteraction[];
  }>;
  topContracts: ContractInteraction[];
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: ContractInteractionsResponse; expires: number }>();

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
    const cacheKey = `contract-interactions:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const contractMap: Record<string, ContractInteraction> = {};
    let totalInteractions = 0;

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
                contractMap[key] = {
                  chainId: chain.id,
                  chainName: chain.name,
                  contractAddress: contractAddr,
                  contractName: tx.to_address_label || 'Unknown Contract',
                  interactionCount: 0,
                  firstInteraction: tx.block_signed_at,
                  lastInteraction: tx.block_signed_at,
                  functionCalls: {},
                  totalValueUSD: 0,
                  isVerified: false, // Would need separate API call to verify
                };
              }

              contractMap[key].interactionCount++;
              totalInteractions++;
              
              if (tx.block_signed_at < contractMap[key].firstInteraction) {
                contractMap[key].firstInteraction = tx.block_signed_at;
              }
              if (tx.block_signed_at > contractMap[key].lastInteraction) {
                contractMap[key].lastInteraction = tx.block_signed_at;
              }

              contractMap[key].totalValueUSD += parseFloat(tx.value_quote || '0');

              // Extract function calls from log events
              for (const log of tx.log_events || []) {
                if (log.decoded && log.decoded.name) {
                  const funcName = log.decoded.name;
                  contractMap[key].functionCalls[funcName] = 
                    (contractMap[key].functionCalls[funcName] || 0) + 1;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching contract interactions for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    const interactions = Object.values(contractMap);
    const topContracts = interactions
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, 10);

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const interaction of interactions) {
      const chainKey = interaction.chainName;
      if (!byChain[chainKey]) {
        byChain[chainKey] = {
          chainId: interaction.chainId,
          chainName: interaction.chainName,
          contractCount: 0,
          interactionCount: 0,
          contracts: [],
        };
      }
      byChain[chainKey].contractCount += 1;
      byChain[chainKey].interactionCount += interaction.interactionCount;
      byChain[chainKey].contracts.push(interaction);
    }

    const result: ContractInteractionsResponse = {
      address: address.toLowerCase(),
      totalContracts: interactions.length,
      totalInteractions,
      interactions: interactions.sort((a, b) => b.interactionCount - a.interactionCount),
      byChain,
      topContracts,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching contract interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract interactions', details: error.message },
      { status: 500 }
    );
  }
}
