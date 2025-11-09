import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface IPWhitelist {
  id: string;
  address: string;
  ipAddresses: string[];
  active: boolean;
  createdAt: string;
  lastUpdated: string;
}

// In-memory storage (in production, use database)
const ipWhitelists: Map<string, IPWhitelist> = new Map();

/**
 * GET /api/security/whitelist
 * Get IP whitelist for an address
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
    const whitelist = ipWhitelists.get(normalizedAddress);

    if (!whitelist) {
      return NextResponse.json({
        success: true,
        whitelist: null,
        message: 'No IP whitelist configured',
      });
    }

    return NextResponse.json({
      success: true,
      whitelist: {
        id: whitelist.id,
        address: whitelist.address,
        ipCount: whitelist.ipAddresses.length,
        active: whitelist.active,
        createdAt: whitelist.createdAt,
        lastUpdated: whitelist.lastUpdated,
        // Don't expose full IPs for security (or expose if user owns it)
        ipAddresses: whitelist.ipAddresses.map((ip) => {
          // Mask IP for security
          const parts = ip.split('.');
          return `${parts[0]}.${parts[1]}.*.*`;
        }),
      },
    });
  } catch (error) {
    console.error('IP whitelist API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch IP whitelist',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/security/whitelist
 * Create or update IP whitelist
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, ipAddresses } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!ipAddresses || !Array.isArray(ipAddresses)) {
      return NextResponse.json(
        { error: 'ipAddresses array is required' },
        { status: 400 }
      );
    }

    // Validate IP addresses
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const invalidIPs = ipAddresses.filter((ip: string) => !ipRegex.test(ip));
    if (invalidIPs.length > 0) {
      return NextResponse.json(
        { error: `Invalid IP addresses: ${invalidIPs.join(', ')}` },
        { status: 400 }
      );
    }

    // Limit to 10 IPs per address
    if (ipAddresses.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 IP addresses per whitelist' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const existing = ipWhitelists.get(normalizedAddress);

    const whitelist: IPWhitelist = {
      id: existing?.id || `${normalizedAddress}-${Date.now()}`,
      address: normalizedAddress,
      ipAddresses: [...new Set(ipAddresses)], // Remove duplicates
      active: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    ipWhitelists.set(normalizedAddress, whitelist);

    return NextResponse.json({
      success: true,
      whitelist: {
        id: whitelist.id,
        address: whitelist.address,
        ipCount: whitelist.ipAddresses.length,
        active: whitelist.active,
      },
      message: 'IP whitelist updated successfully',
    });
  } catch (error) {
    console.error('IP whitelist API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update IP whitelist',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/security/whitelist
 * Remove IP whitelist
 */
export async function DELETE(request: NextRequest) {
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
    const deleted = ipWhitelists.delete(normalizedAddress);

    if (!deleted) {
      return NextResponse.json(
        { error: 'IP whitelist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'IP whitelist removed successfully',
    });
  } catch (error) {
    console.error('IP whitelist API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove IP whitelist',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to check if IP is whitelisted
 */
export function isIPWhitelisted(address: string, ipAddress: string): boolean {
  const normalizedAddress = address.toLowerCase();
  const whitelist = ipWhitelists.get(normalizedAddress);

  if (!whitelist || !whitelist.active) {
    return false; // No whitelist = allow all (or deny based on security policy)
  }

  return whitelist.ipAddresses.includes(ipAddress);
}

