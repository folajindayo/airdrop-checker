import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-tax-analyzer/[address]
 * Analyze token tax structure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `tax-analyzer:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const tax = {
      tokenAddress: address,
      buyTax: '0',
      sellTax: '0',
      transferTax: '0',
      hasTax: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, tax, 300 * 1000);
    return NextResponse.json(tax);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze tax' },
      { status: 500 }
    );
  }
}
