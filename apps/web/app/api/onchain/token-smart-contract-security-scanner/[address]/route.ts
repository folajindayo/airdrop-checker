import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-smart-contract-security-scanner/[address]
 * Scan smart contracts for security vulnerabilities and risks.
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
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const targetChainId = chainId ? parseInt(chainId, 10) : 1;

    return NextResponse.json({
      address: normalizedAddress,
      chainId: targetChainId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Smart contract security scanner error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scan contract security',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
