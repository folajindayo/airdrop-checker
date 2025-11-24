import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-order-book/[address]
 * Get order book data for token trading pairs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const pair = searchParams.get('pair');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `order-book:${address}:${pair || 'default'}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const orderBook = {
      tokenAddress: address,
      pair: pair || 'ETH',
      bids: Array.from({ length: limit }, (_, i) => ({
        price: (100 - i * 0.1).toFixed(2),
        amount: (1000 - i * 50).toString(),
      })),
      asks: Array.from({ length: limit }, (_, i) => ({
        price: (100.1 + i * 0.1).toFixed(2),
        amount: (1000 - i * 50).toString(),
      })),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, orderBook, 10 * 1000);
    return NextResponse.json(orderBook);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch order book' },
      { status: 500 }
    );
  }
}

