import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, rateLimitMiddleware } from '../_middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/airdrops
 * List all available airdrops with optional filtering
 */
export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const chain = searchParams.get('chain');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // This will be implemented by the service layer
    // For now, return a structured response
    return {
      success: true,
      data: {
        airdrops: [],
        pagination: {
          limit,
          offset,
          total: 0,
        },
        filters: {
          status,
          chain,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  })(req);
}

/**
 * POST /api/v1/airdrops/check
 * Check airdrop eligibility for a specific address
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

  return withErrorHandling(async () => {
    const body = await req.json();
    const { address, projects } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Address is required' },
        { status: 400 }
      );
    }

    return {
      success: true,
      data: {
        address,
        checked: projects || [],
        results: [],
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  })(req);
}

