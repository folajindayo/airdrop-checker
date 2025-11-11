import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ShareLink {
  id: string;
  address: string;
  shareType: 'eligibility' | 'portfolio' | 'roi' | 'comparison';
  data: any;
  createdAt: string;
  expiresAt: string;
  views: number;
  public: boolean;
}

// In-memory storage (in production, use database)
const shareLinks: Map<string, ShareLink> = new Map();

/**
 * POST /api/share
 * Create a shareable link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, shareType, data, public: isPublic = false, expiresInHours = 24 } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!shareType || !['eligibility', 'portfolio', 'roi', 'comparison'].includes(shareType)) {
      return NextResponse.json(
        { error: 'Valid shareType required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const shareId = `${normalizedAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const shareLink: ShareLink = {
      id: shareId,
      address: normalizedAddress,
      shareType,
      data,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      views: 0,
      public: isPublic,
    };

    shareLinks.set(shareId, shareLink);

    const shareUrl = `${request.nextUrl.origin}/share/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresAt: shareLink.expiresAt,
      message: 'Share link created successfully',
    });
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create share link',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/share/[id]
 * Get shared data by share ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID required' },
        { status: 400 }
      );
    }

    const shareLink = shareLinks.get(shareId);

    if (!shareLink) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date(shareLink.expiresAt) < new Date()) {
      shareLinks.delete(shareId);
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      );
    }

    // Increment views
    shareLink.views += 1;
    shareLinks.set(shareId, shareLink);

    return NextResponse.json({
      success: true,
      shareLink: {
        id: shareLink.id,
        shareType: shareLink.shareType,
        data: shareLink.data,
        createdAt: shareLink.createdAt,
        views: shareLink.views,
      },
    });
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch share link',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



