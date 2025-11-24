import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // In production, fetch from database
    // For now, return default preferences
    const preferences = {
      email: '',
      emailEnabled: false,
      pushEnabled: true,
      twitterEnabled: false,
      discordEnabled: false,
      alertTypes: {
        newAirdrops: true,
        snapshots: true,
        claimLive: true,
        eligibilityChanges: true,
        priceAlerts: false,
      },
      minPriority: 'medium',
    };

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Alert preferences API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const preferences = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // In production, save to database
    console.log('Saving preferences for', address, preferences);

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Save preferences API error:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

