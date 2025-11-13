import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface SimulatedTransaction {
  type: 'swap' | 'bridge' | 'mint' | 'stake' | 'transfer';
  protocol: string;
  chainId: number;
  chainName: string;
  estimatedGasUSD: number;
  impactScore: number;
  affectedAirdrops: Array<{
    projectId: string;
    projectName: string;
    scoreChange: number;
    newScore: number;
  }>;
}

interface TransactionSimulatorResponse {
  address: string;
  currentScores: Record<string, number>;
  simulations: SimulatedTransaction[];
  recommendations: string[];
  timestamp: number;
}

// Mock airdrop criteria checks
const AIRDROP_CRITERIA: Record<string, Array<{ check: string; weight: number }>> = {
  zora: [
    { check: 'nft_platform=zora', weight: 30 },
    { check: 'chain=base', weight: 20 },
    { check: 'protocol=zora', weight: 50 },
  ],
  layerzero: [
    { check: 'protocol=stargate', weight: 40 },
    { check: 'bridge_count>=3', weight: 30 },
    { check: 'cross_chain_tx>0', weight: 30 },
  ],
  starknet: [
    { check: 'chain=starknet', weight: 50 },
    { check: 'defi_interaction>5', weight: 30 },
    { check: 'nft_interaction>0', weight: 20 },
  ],
};

function estimateScoreChange(
  projectId: string,
  transactionType: string,
  protocol: string,
  chainId: number
): number {
  const criteria = AIRDROP_CRITERIA[projectId] || [];
  let scoreChange = 0;

  criteria.forEach((criterion) => {
    const check = criterion.check.toLowerCase();
    
    // Check protocol match
    if (check.includes('protocol=') && check.includes(protocol.toLowerCase())) {
      scoreChange += criterion.weight * 0.3;
    }
    
    // Check chain match
    if (check.includes('chain=')) {
      const chainName = SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name.toLowerCase();
      if (chainName && check.includes(chainName)) {
        scoreChange += criterion.weight * 0.2;
      }
    }
    
    // Check transaction type
    if (transactionType === 'mint' && check.includes('nft')) {
      scoreChange += criterion.weight * 0.2;
    }
    if (transactionType === 'bridge' && check.includes('bridge')) {
      scoreChange += criterion.weight * 0.3;
    }
    if (transactionType === 'swap' && check.includes('defi')) {
      scoreChange += criterion.weight * 0.2;
    }
  });

  return Math.min(scoreChange, 20); // Cap at 20 points per transaction
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, currentScores } = body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!currentScores || typeof currentScores !== 'object') {
      return NextResponse.json(
        { error: 'Current scores object is required' },
        { status: 400 }
      );
    }

    // Simulate different transaction types
    const simulations: SimulatedTransaction[] = [];

    // Swap transactions
    const swapProtocols = ['uniswap', 'sushiswap', 'curve', 'balancer'];
    swapProtocols.forEach((protocol) => {
      SUPPORTED_CHAINS.slice(0, 3).forEach((chain) => {
        const affectedAirdrops: SimulatedTransaction['affectedAirdrops'] = [];
        
        Object.keys(currentScores).forEach((projectId) => {
          const scoreChange = estimateScoreChange(projectId, 'swap', protocol, chain.id);
          if (scoreChange > 0) {
            affectedAirdrops.push({
              projectId,
              projectName: projectId.charAt(0).toUpperCase() + projectId.slice(1),
              scoreChange,
              newScore: Math.min(100, (currentScores[projectId] || 0) + scoreChange),
            });
          }
        });

        if (affectedAirdrops.length > 0) {
          simulations.push({
            type: 'swap',
            protocol,
            chainId: chain.id,
            chainName: chain.name,
            estimatedGasUSD: 5 + Math.random() * 10,
            impactScore: affectedAirdrops.reduce((sum, a) => sum + a.scoreChange, 0),
            affectedAirdrops,
          });
        }
      });
    });

    // Bridge transactions
    const bridgeProtocols = ['stargate', 'hop', 'across'];
    bridgeProtocols.forEach((protocol) => {
      SUPPORTED_CHAINS.slice(0, 2).forEach((chain) => {
        const affectedAirdrops: SimulatedTransaction['affectedAirdrops'] = [];
        
        Object.keys(currentScores).forEach((projectId) => {
          const scoreChange = estimateScoreChange(projectId, 'bridge', protocol, chain.id);
          if (scoreChange > 0) {
            affectedAirdrops.push({
              projectId,
              projectName: projectId.charAt(0).toUpperCase() + projectId.slice(1),
              scoreChange,
              newScore: Math.min(100, (currentScores[projectId] || 0) + scoreChange),
            });
          }
        });

        if (affectedAirdrops.length > 0) {
          simulations.push({
            type: 'bridge',
            protocol,
            chainId: chain.id,
            chainName: chain.name,
            estimatedGasUSD: 10 + Math.random() * 20,
            impactScore: affectedAirdrops.reduce((sum, a) => sum + a.scoreChange, 0),
            affectedAirdrops,
          });
        }
      });
    });

    // NFT Mint transactions
    const nftPlatforms = ['zora', 'opensea', 'blur'];
    nftPlatforms.forEach((protocol) => {
      SUPPORTED_CHAINS.slice(0, 2).forEach((chain) => {
        const affectedAirdrops: SimulatedTransaction['affectedAirdrops'] = [];
        
        Object.keys(currentScores).forEach((projectId) => {
          const scoreChange = estimateScoreChange(projectId, 'mint', protocol, chain.id);
          if (scoreChange > 0) {
            affectedAirdrops.push({
              projectId,
              projectName: projectId.charAt(0).toUpperCase() + projectId.slice(1),
              scoreChange,
              newScore: Math.min(100, (currentScores[projectId] || 0) + scoreChange),
            });
          }
        });

        if (affectedAirdrops.length > 0) {
          simulations.push({
            type: 'mint',
            protocol,
            chainId: chain.id,
            chainName: chain.name,
            estimatedGasUSD: 3 + Math.random() * 7,
            impactScore: affectedAirdrops.reduce((sum, a) => sum + a.scoreChange, 0),
            affectedAirdrops,
          });
        }
      });
    });

    // Sort by impact score
    simulations.sort((a, b) => b.impactScore - a.impactScore);

    // Generate recommendations
    const recommendations: string[] = [];
    
    const topSimulations = simulations.slice(0, 3);
    if (topSimulations.length > 0) {
      recommendations.push(
        `Top impact transaction: ${topSimulations[0].type} on ${topSimulations[0].protocol} (${topSimulations[0].chainName})`
      );
    }

    const highImpactSims = simulations.filter((s) => s.impactScore > 10);
    if (highImpactSims.length > 0) {
      recommendations.push(
        `${highImpactSims.length} high-impact transactions identified. Focus on these for maximum score improvement.`
      );
    }

    const lowGasSims = simulations
      .filter((s) => s.estimatedGasUSD < 5)
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 3);
    if (lowGasSims.length > 0) {
      recommendations.push(
        `Low-cost, high-impact options available. Consider ${lowGasSims.map((s) => s.protocol).join(', ')}.`
      );
    }

    const response: TransactionSimulatorResponse = {
      address,
      currentScores,
      simulations: simulations.slice(0, 20), // Limit to top 20
      recommendations,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error simulating transactions:', error);
    return NextResponse.json(
      { error: 'Failed to simulate transactions' },
      { status: 500 }
    );
  }
}



