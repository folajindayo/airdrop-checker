import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';

interface WalletComparison {
  address: string;
  overallScore: number;
  totalAirdrops: number;
  highScoreAirdrops: number;
  averageScore: number;
}

interface ComparisonResult {
  wallets: WalletComparison[];
  winner: {
    address: string;
    metric: string;
    value: number;
  };
  summary: {
    totalWallets: number;
    averageOverallScore: number;
    totalEligibleAirdrops: number;
  };
}

/**
 * POST /api/compare
 * Compare multiple wallet addresses for airdrop eligibility
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses } = body;

    // Validate input
    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected array of addresses.' },
        { status: 400 }
      );
    }

    if (addresses.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 wallet addresses are required for comparison.' },
        { status: 400 }
      );
    }

    if (addresses.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 wallet addresses allowed for comparison.' },
        { status: 400 }
      );
    }

    // Validate all addresses
    const invalidAddresses = addresses.filter(
      (addr: string) => !isAddress(addr)
    );

    if (invalidAddresses.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid wallet addresses detected',
          invalidAddresses,
        },
        { status: 400 }
      );
    }

    // Fetch eligibility data for each wallet
    const baseUrl = request.nextUrl.origin;
    const walletDataPromises = addresses.map(async (address: string) => {
      try {
        const response = await fetch(
          `${baseUrl}/api/airdrop-check/${address}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${address}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`Error fetching data for ${address}:`, error);
        return null;
      }
    });

    const walletDataArray = await Promise.all(walletDataPromises);

    // Filter out failed requests
    const validWalletData = walletDataArray.filter((data) => data !== null);

    if (validWalletData.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch eligibility data for all wallets' },
        { status: 500 }
      );
    }

    // Process comparison data
    const comparisons: WalletComparison[] = validWalletData.map((data) => {
      const highScoreAirdrops = data.airdrops.filter(
        (airdrop: any) => airdrop.score >= 70
      ).length;

      const averageScore =
        data.airdrops.reduce((sum: number, airdrop: any) => sum + airdrop.score, 0) /
        data.airdrops.length;

      return {
        address: data.address,
        overallScore: data.overallScore,
        totalAirdrops: data.airdrops.length,
        highScoreAirdrops,
        averageScore: Math.round(averageScore),
      };
    });

    // Determine winner (highest overall score)
    const winner = comparisons.reduce((prev, current) =>
      current.overallScore > prev.overallScore ? current : prev
    );

    // Calculate summary statistics
    const summary = {
      totalWallets: comparisons.length,
      averageOverallScore: Math.round(
        comparisons.reduce((sum, w) => sum + w.overallScore, 0) /
          comparisons.length
      ),
      totalEligibleAirdrops: Math.max(
        ...comparisons.map((w) => w.totalAirdrops)
      ),
    };

    const result: ComparisonResult = {
      wallets: comparisons,
      winner: {
        address: winner.address,
        metric: 'Overall Score',
        value: winner.overallScore,
      },
      summary,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Wallet comparison error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error during wallet comparison',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compare
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/compare',
    method: 'POST',
    description: 'Compare multiple wallet addresses for airdrop eligibility',
    requestBody: {
      addresses: ['0x...', '0x...'],
    },
    limits: {
      minAddresses: 2,
      maxAddresses: 5,
    },
    example: {
      addresses: [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      ],
    },
  });
}

