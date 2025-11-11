import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface APIKey {
  id: string;
  key: string;
  address?: string;
  name: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  active: boolean;
}

// In-memory storage (in production, use database with hashed keys)
const apiKeys: Map<string, APIKey> = new Map();

/**
 * POST /api/auth/api-key
 * Generate a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, name, permissions, expiresInDays } = body;

    if (address && !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    // Generate API key
    const keyPrefix = 'ak_';
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const apiKey = `${keyPrefix}${randomBytes}`;

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const keyData: APIKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key: apiKey,
      address: address?.toLowerCase(),
      name,
      permissions: permissions || ['read'],
      createdAt: new Date().toISOString(),
      expiresAt,
      active: true,
    };

    apiKeys.set(apiKey, keyData);

    return NextResponse.json({
      success: true,
      apiKey,
      keyData: {
        id: keyData.id,
        name: keyData.name,
        permissions: keyData.permissions,
        createdAt: keyData.createdAt,
        expiresAt: keyData.expiresAt,
      },
      warning: 'Store this API key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate API key',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/api-key
 * List API keys for an address
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
    const userKeys = Array.from(apiKeys.values()).filter(
      (k) => k.address === normalizedAddress
    );

    return NextResponse.json({
      success: true,
      keys: userKeys.map((k) => ({
        id: k.id,
        name: k.name,
        permissions: k.permissions,
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
        expiresAt: k.expiresAt,
        active: k.active,
        // Don't expose full key
        keyPreview: k.key.slice(0, 10) + '...',
      })),
      count: userKeys.length,
    });
  } catch (error) {
    console.error('API key list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list API keys',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/api-key
 * Revoke an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID required' },
        { status: 400 }
      );
    }

    const key = Array.from(apiKeys.values()).find((k) => k.id === keyId);
    if (!key) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    apiKeys.delete(key.key);

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('API key revocation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revoke API key',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to validate API key
 */
export function validateAPIKey(apiKey: string): { valid: boolean; keyData?: APIKey } {
  const keyData = apiKeys.get(apiKey);
  
  if (!keyData) {
    return { valid: false };
  }

  if (!keyData.active) {
    return { valid: false };
  }

  if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
    return { valid: false };
  }

  // Update last used
  keyData.lastUsed = new Date().toISOString();
  apiKeys.set(apiKey, keyData);

  return { valid: true, keyData };
}



