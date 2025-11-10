import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { fetchAllChainTransactions } from '@/lib/goldrush';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gas-tracker/[address]
 * Track gas spending for a wallet address
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

    // Gas price estimates by chain (in gwei)
    const gasPriceByChain: Record<number, number> = {
      1: 25, // Ethereum
      8453: 0.2, // Base
      42161: 0.15, // Arbitrum
      10: 0.2, // Optimism
      324: 0.2, // zkSync Era
      137: 50, // Polygon
    };

    // Calculate gas spent
    let totalGasSpentUSD = 0;
    const gasByChain: Record<number, { gasUsed: number; costUSD: number; txCount: number }> = {};

    Object.entries(chainTransactions).forEach(([chainId, txs]) => {
      const chainIdNum = parseInt(chainId, 10);
      const avgGasPrice = gasPriceByChain[chainIdNum] || 1;
      
      let gasUsed = 0;
      txs.forEach((tx: any) => {
        // Use actual gas_used if available, otherwise estimate 100k per tx
        const gas = tx.gas_used || 100000;
        gasUsed += gas;
      });

      // Convert to USD (rough estimate: 1 gwei = $0.000001 per gas unit)
      const costUSD = (gasUsed * avgGasPrice) / 1e9;
      totalGasSpentUSD += costUSD;

      gasByChain[chainIdNum] = {
        gasUsed,
        costUSD,
        txCount: txs.length,
      };
    });

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      totalGasSpentUSD: Math.round(totalGasSpentUSD * 100) / 100,
      gasByChain,
      totalTransactions: Object.values(chainTransactions).reduce((sum, txs) => sum + txs.length, 0),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Gas tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track gas spending',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
