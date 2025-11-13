import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface UserPreferences {
  address: string;
  notifications: {
    email: boolean;
    push: boolean;
    discord: boolean;
    telegram: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    currency: 'USD' | 'EUR' | 'ETH';
    language: string;
  };
  alerts: {
    newAirdrops: boolean;
    eligibilityUpdates: boolean;
    claimReminders: boolean;
    gasPriceAlerts: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    publicProfile: boolean;
  };
}

// In-memory storage (in production, use database)
const preferences: Map<string, UserPreferences> = new Map();

/**
 * GET /api/preferences
 * Get user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const userPrefs = preferences.get(address.toLowerCase()) || {
      address: address.toLowerCase(),
      notifications: {
        email: false,
        push: true,
        discord: false,
        telegram: false,
      },
      display: {
        theme: 'auto',
        currency: 'USD',
        language: 'en',
      },
      alerts: {
        newAirdrops: true,
        eligibilityUpdates: true,
        claimReminders: true,
        gasPriceAlerts: false,
      },
      privacy: {
        shareAnalytics: true,
        publicProfile: false,
      },
    };

    return NextResponse.json({
      success: true,
      preferences: userPrefs,
    });
  } catch (error) {
    console.error('Preferences API error:', error);
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
 * POST /api/preferences
 * Update user preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, preferences: prefs } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const existingPrefs = preferences.get(address.toLowerCase()) || {
      address: address.toLowerCase(),
      notifications: {
        email: false,
        push: true,
        discord: false,
        telegram: false,
      },
      display: {
        theme: 'auto',
        currency: 'USD',
        language: 'en',
      },
      alerts: {
        newAirdrops: true,
        eligibilityUpdates: true,
        claimReminders: true,
        gasPriceAlerts: false,
      },
      privacy: {
        shareAnalytics: true,
        publicProfile: false,
      },
    };

    const updatedPrefs: UserPreferences = {
      ...existingPrefs,
      ...prefs,
      address: address.toLowerCase(),
    };

    preferences.set(address.toLowerCase(), updatedPrefs);

    return NextResponse.json({
      success: true,
      preferences: updatedPrefs,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Preferences API error:', error);
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



