import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // In production, update all alerts in database
    console.log('Marking all alerts as read for:', address);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all as read API error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all alerts as read' },
      { status: 500 }
    );
  }
}

