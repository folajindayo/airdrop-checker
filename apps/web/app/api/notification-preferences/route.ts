import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface NotificationPreferences {
  address: string;
  email?: string;
  preferences: {
    newAirdrops: boolean;
    eligibilityChanges: boolean;
    snapshotReminders: boolean;
    claimAlerts: boolean;
    scoreImprovements: boolean;
    weeklyDigest: boolean;
    highPriorityOnly: boolean;
  };
  channels: {
    email: boolean;
    webhook: boolean;
    push: boolean;
  };
  frequency: 'realtime' | 'daily' | 'weekly';
  thresholds: {
    minScoreChange: number;
    minAirdropValue: number;
  };
}

// In-memory storage (in production, use database)
const preferencesStore = new Map<string, NotificationPreferences>();

/**
 * GET /api/notification-preferences
 * Get notification preferences for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const preferences = preferencesStore.get(normalizedAddress) || {
      address: normalizedAddress,
      preferences: {
        newAirdrops: true,
        eligibilityChanges: true,
        snapshotReminders: true,
        claimAlerts: true,
        scoreImprovements: true,
        weeklyDigest: false,
        highPriorityOnly: false,
      },
      channels: {
        email: false,
        webhook: false,
        push: true,
      },
      frequency: 'realtime' as const,
      thresholds: {
        minScoreChange: 5,
        minAirdropValue: 100,
      },
    };

    return NextResponse.json({
      success: true,
      ...preferences,
    });
  } catch (error) {
    console.error('Notification preferences API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notification-preferences
 * Create or update notification preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      email,
      preferences,
      channels,
      frequency,
      thresholds,
    } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Get existing preferences or create defaults
    const existing = preferencesStore.get(normalizedAddress) || {
      address: normalizedAddress,
      preferences: {
        newAirdrops: true,
        eligibilityChanges: true,
        snapshotReminders: true,
        claimAlerts: true,
        scoreImprovements: true,
        weeklyDigest: false,
        highPriorityOnly: false,
      },
      channels: {
        email: false,
        webhook: false,
        push: true,
      },
      frequency: 'realtime' as const,
      thresholds: {
        minScoreChange: 5,
        minAirdropValue: 100,
      },
    };

    // Merge with new preferences
    const updated: NotificationPreferences = {
      address: normalizedAddress,
      email: email || existing.email,
      preferences: {
        ...existing.preferences,
        ...preferences,
      },
      channels: {
        ...existing.channels,
        ...channels,
      },
      frequency: frequency || existing.frequency,
      thresholds: {
        ...existing.thresholds,
        ...thresholds,
      },
    };

    preferencesStore.set(normalizedAddress, updated);

    return NextResponse.json({
      success: true,
      ...updated,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Notification preferences API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notification-preferences
 * Delete notification preferences
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    if (preferencesStore.has(normalizedAddress)) {
      preferencesStore.delete(normalizedAddress);
      return NextResponse.json({
        success: true,
        message: 'Preferences deleted successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Preferences not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Notification preferences API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



