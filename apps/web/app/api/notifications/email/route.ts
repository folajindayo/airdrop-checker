import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface EmailSubscription {
  id: string;
  address: string;
  email: string;
  events: string[];
  verified: boolean;
  active: boolean;
  createdAt: string;
  verificationToken?: string;
}

// In-memory storage (in production, use database)
const emailSubscriptions: Map<string, EmailSubscription[]> = new Map();

/**
 * POST /api/notifications/email
 * Subscribe to email notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, email, events } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'events array is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const normalizedEmail = email.toLowerCase();
    const subscriptions = emailSubscriptions.get(normalizedAddress) || [];

    // Check if email already subscribed
    const existing = subscriptions.find((s) => s.email === normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already subscribed for this address' },
        { status: 409 }
      );
    }

    // Limit to 3 email subscriptions per address
    if (subscriptions.length >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 email subscriptions per address' },
        { status: 400 }
      );
    }

    const verificationToken = Math.random().toString(36).substr(2, 32);

    const subscription: EmailSubscription = {
      id: `${normalizedAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: normalizedAddress,
      email: normalizedEmail,
      events,
      verified: false,
      active: false,
      createdAt: new Date().toISOString(),
      verificationToken,
    };

    subscriptions.push(subscription);
    emailSubscriptions.set(normalizedAddress, subscriptions);

    // In production, send verification email here
    // For now, return verification token (in production, send via email)

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        email: subscription.email,
        events: subscription.events,
        verified: subscription.verified,
        active: subscription.active,
      },
      verificationToken, // In production, don't return this - send via email
      message: 'Email subscription created. Please verify your email.',
    });
  } catch (error) {
    console.error('Email notifications API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create email subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/email
 * Get email subscriptions for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address parameter required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const subscriptions = emailSubscriptions.get(normalizedAddress) || [];

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        email: s.email,
        events: s.events,
        verified: s.verified,
        active: s.active,
        createdAt: s.createdAt,
      })),
      count: subscriptions.length,
    });
  } catch (error) {
    console.error('Email notifications API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch email subscriptions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/email
 * Verify email subscription
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, token } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const subscriptions = emailSubscriptions.get(normalizedAddress) || [];

    const subscription = subscriptions.find((s) => s.verificationToken === token);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 404 }
      );
    }

    subscription.verified = true;
    subscription.active = true;
    delete subscription.verificationToken;

    emailSubscriptions.set(normalizedAddress, subscriptions);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email notifications API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

