import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ContractInteraction {
  contractAddress: string;
  contractName: string;
  chainId: number;
  chainName: string;
  interactionCount: number;
  firstInteraction: string;
  lastInteraction: string;
  totalValue: number;
  functionCalls: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high';
  verified: boolean;
}

interface ContractAnalysisData {
  address: string;
  totalContracts: number;
  interactions: ContractInteraction[];
  topContracts: ContractInteraction[];
  riskSummary: {
    low: number;
    medium: number;
    high: number;
  };
  recommendations: string[];
  timestamp: number;
}

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

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `contract-analyzer:${normalizedAddress}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const contractMap = new Map<string, ContractInteraction>();

    // Analyze transactions across all chains
    for (const chain of SUPPORTED_CHAINS) {
      try {
        const response = await goldrushClient.get(
          `/${chain.goldrushName}/address/${normalizedAddress}/transactions_v2/`,
          { 'page-size': 100 }
        );

        if (response.data?.items) {
          response.data.items.forEach((tx: any) => {
            const contractAddr = (tx.to_address || '').toLowerCase();
            if (!contractAddr || contractAddr === normalizedAddress) return;

            const key = `${contractAddr}-${chain.id}`;
            
            if (!contractMap.has(key)) {
              contractMap.set(key, {
                contractAddress: contractAddr,
                contractName: tx.to_address_label || 'Unknown Contract',
                chainId: chain.id,
                chainName: chain.name,
                interactionCount: 0,
                firstInteraction: tx.block_signed_at,
                lastInteraction: tx.block_signed_at,
                totalValue: 0,
                functionCalls: {},
                riskLevel: 'low',
                verified: false,
              });
            }

            const contract = contractMap.get(key)!;
            contract.interactionCount += 1;
            contract.totalValue += tx.value_quote || 0;
            
            if (new Date(tx.block_signed_at) < new Date(contract.firstInteraction)) {
              contract.firstInteraction = tx.block_signed_at;
            }
            if (new Date(tx.block_signed_at) > new Date(contract.lastInteraction)) {
              contract.lastInteraction = tx.block_signed_at;
            }

            // Analyze function calls if available
            if (tx.log_events) {
              tx.log_events.forEach((log: any) => {
                if (log.decoded?.name) {
                  const funcName = log.decoded.name;
                  contract.functionCalls[funcName] = (contract.functionCalls[funcName] || 0) + 1;
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error analyzing contracts for ${chain.name}:`, error);
      }
    }

    // Calculate risk levels
    contractMap.forEach((contract) => {
      let riskScore = 0;
      
      // High interaction count might indicate automation
      if (contract.interactionCount > 100) riskScore += 2;
      else if (contract.interactionCount > 50) riskScore += 1;

      // High value transactions
      if (contract.totalValue > 100000) riskScore += 2;
      else if (contract.totalValue > 10000) riskScore += 1;

      // Unverified contracts are riskier
      if (!contract.verified) riskScore += 1;

      if (riskScore >= 4) contract.riskLevel = 'high';
      else if (riskScore >= 2) contract.riskLevel = 'medium';
      else contract.riskLevel = 'low';
    });

    const interactions = Array.from(contractMap.values());
    const topContracts = interactions
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, 20);

    const riskSummary = {
      low: interactions.filter((c) => c.riskLevel === 'low').length,
      medium: interactions.filter((c) => c.riskLevel === 'medium').length,
      high: interactions.filter((c) => c.riskLevel === 'high').length,
    };

    const recommendations: string[] = [];
    
    if (riskSummary.high > 0) {
      recommendations.push(`Review ${riskSummary.high} high-risk contract interactions`);
    }
    
    if (interactions.length < 10) {
      recommendations.push('Interact with more verified contracts to improve airdrop eligibility');
    }

    const unverifiedCount = interactions.filter((c) => !c.verified).length;
    if (unverifiedCount > interactions.length * 0.3) {
      recommendations.push('Consider prioritizing verified contracts for better security');
    }

    const result: ContractAnalysisData = {
      address: normalizedAddress,
      totalContracts: interactions.length,
      interactions,
      topContracts,
      riskSummary,
      recommendations,
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing contracts:', error);
    return NextResponse.json(
      { error: 'Failed to analyze contract interactions' },
      { status: 500 }
    );
  }
}



