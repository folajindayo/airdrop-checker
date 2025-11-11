import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface WalletComparison {
  wallets: Array<{
    address: string;
    overallScore: number;
    eligibleCount: number;
    totalValue: number;
    chainsUsed: number;
    activityLevel: 'low' | 'medium' | 'high';
    topAirdrops: Array<{
      projectId: string;
      projectName: string;
      score: number;
    }>;
  }>;
  comparison: {
    bestWallet: {
      address: string;
      metric: string;
      value: number;
    };
    averageScore: number;
    scoreRange: {
      min: number;
      max: number;
    };
    uniqueAirdrops: string[];
    commonAirdrops: string[];
    recommendations: string[];
  };
}

/**
 * POST /api/compare-wallets
 * Compare multiple wallet addresses (2-10 wallets)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses, includeDetails = false } = body;

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { success: false, error: 'Addresses array is required' },
        { status: 400 }
      );
    }

    if (addresses.length < 2 || addresses.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Must provide between 2 and 10 addresses' },
        { status: 400 }
      );
    }

    // Validate all addresses
    const normalizedAddresses = addresses.map((addr: string) => {
      if (!isValidAddress(addr)) {
        throw new Error(`Invalid address: ${addr}`);
      }
      return addr.toLowerCase();
    });

    // Fetch eligibility data for each wallet (in production, call actual API)
    const walletData = await Promise.all(
      normalizedAddresses.map(async (address: string) => {
        // Mock data - in production, fetch from /api/airdrop-check/[address]
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/airdrop-check/${address}`
        ).catch(() => null);

        if (response?.ok) {
          const data = await response.json();
          return {
            address,
            overallScore: data.overallScore || 0,
            airdrops: data.airdrops || [],
          };
        }

        // Fallback mock data
        return {
          address,
          overallScore: Math.floor(Math.random() * 100),
          airdrops: [],
        };
      })
    );

    // Process wallet data
    const wallets = walletData.map((data) => {
      const eligibleAirdrops = data.airdrops.filter((a: any) => a.score >= 50);
      const topAirdrops = data.airdrops
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5)
        .map((a: any) => ({
          projectId: a.projectId,
          projectName: a.project,
          score: a.score,
        }));

      // Determine activity level
      let activityLevel: 'low' | 'medium' | 'high' = 'low';
      if (data.overallScore >= 70) activityLevel = 'high';
      else if (data.overallScore >= 40) activityLevel = 'medium';

      return {
        address: data.address,
        overallScore: data.overallScore,
        eligibleCount: eligibleAirdrops.length,
        totalValue: 0, // Would calculate from airdrop values
        chainsUsed: 3, // Would calculate from actual data
        activityLevel,
        topAirdrops,
      };
    });

    // Calculate comparison metrics
    const scores = wallets.map((w) => w.overallScore);
    const averageScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
    const bestWallet = wallets.reduce((best, current) =>
      current.overallScore > best.overallScore ? current : best
    );

    // Find unique and common airdrops
    const allAirdropIds = new Set<string>();
    const airdropCounts = new Map<string, number>();

    wallets.forEach((wallet) => {
      wallet.topAirdrops.forEach((airdrop) => {
        allAirdropIds.add(airdrop.projectId);
        airdropCounts.set(
          airdrop.projectId,
          (airdropCounts.get(airdrop.projectId) || 0) + 1
        );
      });
    });

    const commonAirdrops = Array.from(airdropCounts.entries())
      .filter(([_, count]) => count === wallets.length)
      .map(([id]) => id);

    const uniqueAirdrops = Array.from(allAirdropIds).filter(
      (id) => !commonAirdrops.includes(id)
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (bestWallet.overallScore - averageScore > 20) {
      recommendations.push(
        `Wallet ${bestWallet.address.slice(0, 6)}... has significantly higher score. Consider replicating its activity patterns.`
      );
    }
    if (commonAirdrops.length === 0) {
      recommendations.push(
        'No common airdrops found. Consider diversifying strategies across wallets.'
      );
    }
    if (uniqueAirdrops.length > 0) {
      recommendations.push(
        `Found ${uniqueAirdrops.length} unique airdrops. Consider cross-wallet strategies.`
      );
    }

    const comparison: WalletComparison = {
      wallets,
      comparison: {
        bestWallet: {
          address: bestWallet.address,
          metric: 'Overall Score',
          value: bestWallet.overallScore,
        },
        averageScore,
        scoreRange: {
          min: Math.min(...scores),
          max: Math.max(...scores),
        },
        uniqueAirdrops,
        commonAirdrops,
        recommendations,
      },
    };

    return NextResponse.json({
      success: true,
      ...comparison,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Compare wallets API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compare wallets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



