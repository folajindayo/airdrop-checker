import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { fetchAllChainTokenBalances, calculateTotalValue } from '@/lib/goldrush/tokens';

export const dynamic = 'force-dynamic';

interface BatchCheckResult {
  address: string;
  overallScore: number;
  totalValue: number;
  airdropCount: number;
  topAirdrop: {
    projectId: string;
    score: number;
  };
  error?: string;
}

interface BatchCheckResponse {
  results: BatchCheckResult[];
  summary: {
    totalChecked: number;
    successful: number;
    failed: number;
    averageScore: number;
    totalValue: number;
  };
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'Addresses array is required' },
        { status: 400 }
      );
    }

    if (addresses.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 addresses allowed per batch' },
        { status: 400 }
      );
    }

    // Validate all addresses
    const validAddresses = addresses.filter((addr: string) => {
      if (!isValidAddress(addr)) {
        return false;
      }
      return true;
    });

    if (validAddresses.length === 0) {
      return NextResponse.json(
        { error: 'No valid addresses provided' },
        { status: 400 }
      );
    }

    // Check each address (in production, this would be parallelized)
    const results: BatchCheckResult[] = await Promise.all(
      validAddresses.map(async (address: string) => {
        try {
          // Fetch airdrop eligibility
          const airdropResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/airdrop-check/${address}`
          );
          
          let overallScore = 0;
          let airdropCount = 0;
          let topAirdrop = { projectId: '', score: 0 };

          if (airdropResponse.ok) {
            const airdropData = await airdropResponse.json();
            overallScore = airdropData.overallScore || 0;
            airdropCount = airdropData.airdrops?.length || 0;
            
            if (airdropData.airdrops && airdropData.airdrops.length > 0) {
              const top = airdropData.airdrops.sort((a: any, b: any) => b.score - a.score)[0];
              topAirdrop = {
                projectId: top.projectId || '',
                score: top.score || 0,
              };
            }
          }

          // Fetch portfolio value
          const chainTokens = await fetchAllChainTokenBalances(address);
          const totalValue = calculateTotalValue(chainTokens);

          return {
            address,
            overallScore,
            totalValue,
            airdropCount,
            topAirdrop,
          };
        } catch (error) {
          return {
            address,
            overallScore: 0,
            totalValue: 0,
            airdropCount: 0,
            topAirdrop: { projectId: '', score: 0 },
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const successful = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);

    const summary = {
      totalChecked: results.length,
      successful: successful.length,
      failed: failed.length,
      averageScore: successful.length > 0
        ? successful.reduce((sum, r) => sum + r.overallScore, 0) / successful.length
        : 0,
      totalValue: successful.reduce((sum, r) => sum + r.totalValue, 0),
    };

    const response: BatchCheckResponse = {
      results,
      summary,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in batch check:', error);
    return NextResponse.json(
      { error: 'Failed to perform batch check' },
      { status: 500 }
    );
  }
}



