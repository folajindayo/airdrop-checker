import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { fetchAllChainTransactions } from '@/lib/goldrush';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

interface ROICalculation {
  address: string;
  totalGasSpent: number;
  potentialAirdropValue: number;
  roi: number;
  breakEvenValue: number;
  topOpportunities: Array<{
    projectId: string;
    projectName: string;
    score: number;
    estimatedValue?: string;
    gasToQualify: number;
    potentialROI: number;
  }>;
}

/**
 * POST /api/roi
 * Calculate ROI for airdrop farming activities
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, gasPriceMultiplier = 1 } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch transactions to estimate gas spent
    const chainTransactions = await fetchAllChainTransactions(normalizedAddress);
    
    // Estimate total gas spent (rough calculation)
    let totalGasSpent = 0;
    const gasPriceByChain: Record<number, number> = {
      1: 25, // Ethereum - 25 gwei average
      8453: 0.2, // Base
      42161: 0.15, // Arbitrum
      10: 0.2, // Optimism
      324: 0.2, // zkSync Era
      137: 50, // Polygon
    };

    Object.entries(chainTransactions).forEach(([chainId, txs]) => {
      const chainIdNum = parseInt(chainId, 10);
      const avgGasPrice = gasPriceByChain[chainIdNum] || 1;
      const gasUsed = txs.reduce((sum, tx: any) => {
        // Estimate 100k gas per transaction if not available
        const gas = tx.gas_used || 100000;
        return sum + gas;
      }, 0);
      
      // Convert to USD (rough estimate: 1 gwei = $0.000001 per gas unit)
      const gasCost = (gasUsed * avgGasPrice * gasPriceMultiplier) / 1e9;
      totalGasSpent += gasCost;
    });

    // Fetch projects and calculate potential value
    const projects = await findAllProjects();
    
    // Get eligibility check
    const eligibilityResponse = await fetch(
      `${request.nextUrl.origin}/api/airdrop-check/${normalizedAddress}`
    ).catch(() => null);
    
    const eligibilityData = eligibilityResponse?.ok 
      ? await eligibilityResponse.json()
      : { airdrops: [] };

    // Calculate potential airdrop value
    let potentialAirdropValue = 0;
    const opportunities: ROICalculation['topOpportunities'] = [];

    eligibilityData.airdrops?.forEach((airdrop: any) => {
      const project = projects.find((p) => p.projectId === airdrop.projectId);
      if (!project) return;

      // Estimate value from project data
      let estimatedValue = 0;
      if (project.estimatedValue) {
        // Parse estimated value (e.g., "$100-$500" or "100-500")
        const valueMatch = project.estimatedValue.match(/(\d+)/g);
        if (valueMatch && valueMatch.length > 0) {
          estimatedValue = parseInt(valueMatch[0], 10);
        }
      }

      // Estimate gas needed to qualify (if not already qualified)
      const gasToQualify = airdrop.score < 100 ? totalGasSpent * 0.1 : 0;
      
      // Calculate potential ROI
      const potentialROI = estimatedValue > 0 && (totalGasSpent + gasToQualify) > 0
        ? ((estimatedValue - (totalGasSpent + gasToQualify)) / (totalGasSpent + gasToQualify)) * 100
        : 0;

      if (estimatedValue > 0) {
        potentialAirdropValue += estimatedValue;
      }

      opportunities.push({
        projectId: project.projectId,
        projectName: project.name,
        score: airdrop.score,
        estimatedValue: project.estimatedValue,
        gasToQualify,
        potentialROI,
      });
    });

    // Calculate overall ROI
    const roi = totalGasSpent > 0
      ? ((potentialAirdropValue - totalGasSpent) / totalGasSpent) * 100
      : 0;

    // Calculate break-even value
    const breakEvenValue = totalGasSpent;

    // Sort opportunities by ROI
    opportunities.sort((a, b) => b.potentialROI - a.potentialROI);

    const result: ROICalculation = {
      address: normalizedAddress,
      totalGasSpent: Math.round(totalGasSpent * 100) / 100,
      potentialAirdropValue: Math.round(potentialAirdropValue * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      breakEvenValue: Math.round(breakEvenValue * 100) / 100,
      topOpportunities: opportunities.slice(0, 10),
    };

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('ROI API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate ROI',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

