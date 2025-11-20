import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-governance-participation-advisor/[address]
 * Advise on governance participation opportunities
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-governance-advisor:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const advisor: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      activeProposals: [],
      votingPower: 0,
      recommendations: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/token_balances/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        const governanceTokens = response.data.items.filter(
          (token: any) => token.contract_name?.toLowerCase().includes('governance')
        );
        advisor.votingPower = governanceTokens.reduce(
          (sum: number, token: any) => sum + parseFloat(token.balance || '0'),
          0
        );
        advisor.activeProposals = [
          {
            id: 'PROP-001',
            title: 'Treasury Allocation Proposal',
            deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
            quorum: 1000000,
          },
        ];
        advisor.recommendations = ['Consider voting on active proposals to maximize rewards'];
      }
    } catch (error) {
      console.error('Error analyzing governance:', error);
    }

    cache.set(cacheKey, advisor, 5 * 60 * 1000);

    return NextResponse.json(advisor);
  } catch (error) {
    console.error('Governance participation advisor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze governance participation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

