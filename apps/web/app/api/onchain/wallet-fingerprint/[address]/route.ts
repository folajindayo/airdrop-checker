import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    return NextResponse.json({
      success: true,
      address,
      behaviorType: ['trader', 'holder', 'defi_user', 'nft_collector'][Math.floor(Math.random() * 4)],
      activityPattern: Math.random() > 0.5 ? 'regular' : 'sporadic',
      riskProfile: ['conservative', 'moderate', 'aggressive'][Math.floor(Math.random() * 3)],
      sophisticationScore: Math.floor(Math.random() * 100),
      primaryChains: ['Ethereum', 'Base', 'Arbitrum'],
      fingerprint: 'unique-' + Math.random().toString(36).substring(7),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

