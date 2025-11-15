import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    const nodes = [
      { address, label: 'Origin', type: 'wallet' },
      { address: '0xabc...', label: 'DEX', type: 'contract' },
      { address: '0xdef...', label: 'Wallet 2', type: 'wallet' },
    ];

    const edges = [
      { from: address, to: '0xabc...', weight: 150, type: 'swap' },
      { from: address, to: '0xdef...', weight: 50, type: 'transfer' },
    ];

    return NextResponse.json({
      success: true,
      address,
      nodes,
      edges,
      totalInteractions: edges.length,
      networkDensity: 0.75,
      clustering: 0.42,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

