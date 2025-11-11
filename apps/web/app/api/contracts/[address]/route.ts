import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { fetchAllChainTransactions } from '@/lib/goldrush';

export const dynamic = 'force-dynamic';

interface ContractInteraction {
  contractAddress: string;
  contractName?: string;
  chainId: number;
  interactionCount: number;
  firstInteraction: string;
  lastInteraction: string;
  totalValue: number;
  functionCalls: Record<string, number>;
}

/**
 * GET /api/contracts/[address]
 * Analyze smart contract interactions for a wallet
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

    const normalizedAddress = address.toLowerCase();

    // Fetch all transactions
    const chainTransactions = await fetchAllChainTransactions(normalizedAddress);

    // Analyze contract interactions
    const contractMap = new Map<string, ContractInteraction>();

    Object.entries(chainTransactions).forEach(([chainId, txs]) => {
      const chainIdNum = parseInt(chainId, 10);
      
      txs.forEach((tx: any) => {
        const toAddress = tx.to_address?.toLowerCase();
        if (!toAddress || toAddress === normalizedAddress) return;

        const key = `${chainIdNum}-${toAddress}`;
        const existing = contractMap.get(key) || {
          contractAddress: toAddress,
          chainId: chainIdNum,
          interactionCount: 0,
          firstInteraction: tx.block_signed_at,
          lastInteraction: tx.block_signed_at,
          totalValue: 0,
          functionCalls: {},
        };

        existing.interactionCount += 1;
        existing.totalValue += parseFloat(tx.value || '0');
        
        if (new Date(tx.block_signed_at) < new Date(existing.firstInteraction)) {
          existing.firstInteraction = tx.block_signed_at;
        }
        if (new Date(tx.block_signed_at) > new Date(existing.lastInteraction)) {
          existing.lastInteraction = tx.block_signed_at;
        }

        // Track function calls (if available)
        if (tx.log_events && tx.log_events.length > 0) {
          tx.log_events.forEach((log: any) => {
            const signature = log.decoded?.name || 'unknown';
            existing.functionCalls[signature] = (existing.functionCalls[signature] || 0) + 1;
          });
        }

        contractMap.set(key, existing);
      });
    });

    const interactions = Array.from(contractMap.values())
      .sort((a, b) => b.interactionCount - a.interactionCount);

    // Calculate statistics
    const stats = {
      totalContracts: interactions.length,
      totalInteractions: interactions.reduce((sum, i) => sum + i.interactionCount, 0),
      uniqueChains: new Set(interactions.map((i) => i.chainId)).size,
      totalValue: interactions.reduce((sum, i) => sum + i.totalValue, 0),
      mostActiveContract: interactions[0] || null,
      topContracts: interactions.slice(0, 10),
    };

    // Group by chain
    const byChain: Record<number, ContractInteraction[]> = {};
    interactions.forEach((interaction) => {
      if (!byChain[interaction.chainId]) {
        byChain[interaction.chainId] = [];
      }
      byChain[interaction.chainId].push(interaction);
    });

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      interactions,
      stats,
      byChain,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Contract analyzer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze contract interactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



