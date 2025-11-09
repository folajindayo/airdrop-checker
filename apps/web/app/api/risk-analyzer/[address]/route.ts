import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { fetchAllChainTransactions } from '@/lib/goldrush';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/risk-analyzer/[address]
 * Analyze risk factors for airdrop farming
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

    // Fetch transactions
    const chainTransactions = await fetchAllChainTransactions(normalizedAddress);
    const projects = await findAllProjects();

    // Calculate risk factors
    const risks = {
      // Sybil detection risk (too many similar transactions)
      sybilRisk: 0,
      // Gas spending risk (spending too much)
      gasSpendingRisk: 0,
      // Concentration risk (too focused on one protocol)
      concentrationRisk: 0,
      // Timing risk (all activity in short period)
      timingRisk: 0,
      // Overall risk score
      overallRisk: 0,
    };

    // Analyze transaction patterns
    const totalTxs = Object.values(chainTransactions).reduce((sum, txs) => sum + txs.length, 0);
    const uniqueContracts = new Set<string>();
    const protocolCounts: Record<string, number> = {};
    const txTimestamps: number[] = [];

    Object.entries(chainTransactions).forEach(([chainId, txs]) => {
      txs.forEach((tx: any) => {
        if (tx.to_address) {
          uniqueContracts.add(`${chainId}-${tx.to_address.toLowerCase()}`);
        }
        txTimestamps.push(new Date(tx.block_signed_at).getTime());
      });
    });

    // Sybil risk: too many transactions to same contracts
    const avgTxsPerContract = totalTxs / Math.max(uniqueContracts.size, 1);
    if (avgTxsPerContract > 10) {
      risks.sybilRisk = Math.min(100, (avgTxsPerContract - 10) * 5);
    }

    // Timing risk: all activity in short time window
    if (txTimestamps.length > 0) {
      const sortedTimestamps = txTimestamps.sort((a, b) => a - b);
      const timeSpan = sortedTimestamps[sortedTimestamps.length - 1] - sortedTimestamps[0];
      const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
      
      if (daysSpan < 7 && totalTxs > 20) {
        risks.timingRisk = Math.min(100, (20 / daysSpan) * 10);
      }
    }

    // Concentration risk: too focused on few protocols
    const protocolCount = Object.keys(protocolCounts).length;
    if (protocolCount < 3 && totalTxs > 10) {
      risks.concentrationRisk = Math.min(100, (10 - protocolCount) * 20);
    }

    // Gas spending risk (estimated)
    const estimatedGasSpent = totalTxs * 0.05; // Rough estimate
    if (estimatedGasSpent > 100) {
      risks.gasSpendingRisk = Math.min(100, (estimatedGasSpent - 100) * 0.5);
    }

    // Calculate overall risk
    risks.overallRisk = Math.round(
      (risks.sybilRisk * 0.3 +
       risks.timingRisk * 0.3 +
       risks.concentrationRisk * 0.2 +
       risks.gasSpendingRisk * 0.2)
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (risks.sybilRisk > 50) {
      recommendations.push('Reduce repetitive transactions to same contracts');
    }
    if (risks.timingRisk > 50) {
      recommendations.push('Spread activity over longer time periods');
    }
    if (risks.concentrationRisk > 50) {
      recommendations.push('Diversify across more protocols');
    }
    if (risks.gasSpendingRisk > 50) {
      recommendations.push('Consider using L2s for lower gas costs');
    }

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      risks,
      recommendations,
      metrics: {
        totalTransactions: totalTxs,
        uniqueContracts: uniqueContracts.size,
        avgTxsPerContract: Math.round(avgTxsPerContract * 100) / 100,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Risk analyzer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze risks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

