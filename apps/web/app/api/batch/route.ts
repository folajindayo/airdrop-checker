import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * POST /api/batch
 * Process multiple addresses in batch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses, operation } = body;

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'addresses array is required' },
        { status: 400 }
      );
    }

    if (addresses.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 addresses per batch' },
        { status: 400 }
      );
    }

    // Validate all addresses
    const validAddresses = addresses.filter((addr: string) => isValidAddress(addr));
    if (validAddresses.length !== addresses.length) {
      return NextResponse.json(
        { error: 'One or more invalid addresses' },
        { status: 400 }
      );
    }

    const normalizedAddresses = validAddresses.map((addr: string) => addr.toLowerCase());

    // Process based on operation type
    switch (operation) {
      case 'check':
        // Batch eligibility check
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
        const checkPromises = normalizedAddresses.map(async (address: string) => {
          try {
            const response = await fetch(`${baseUrl}/api/airdrop-check/${address}`);
            if (response.ok) {
              const data = await response.json();
              return { address, success: true, data };
            }
            return { address, success: false, error: 'Failed to fetch' };
          } catch (error) {
            return {
              address,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        });

        const checkResults = await Promise.all(checkPromises);

        return NextResponse.json({
          success: true,
          operation: 'check',
          results: checkResults,
          total: checkResults.length,
          successful: checkResults.filter((r) => r.success).length,
          failed: checkResults.filter((r) => !r.success).length,
        });

      case 'portfolio':
        // Batch portfolio check
        const portfolioPromises = normalizedAddresses.map(async (address: string) => {
          try {
            const response = await fetch(`${baseUrl}/api/portfolio/${address}`);
            if (response.ok) {
              const data = await response.json();
              return { address, success: true, data };
            }
            return { address, success: false, error: 'Failed to fetch' };
          } catch (error) {
            return {
              address,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        });

        const portfolioResults = await Promise.all(portfolioPromises);

        return NextResponse.json({
          success: true,
          operation: 'portfolio',
          results: portfolioResults,
          total: portfolioResults.length,
          successful: portfolioResults.filter((r) => r.success).length,
          failed: portfolioResults.filter((r) => !r.success).length,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported: check, portfolio' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Batch API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process batch request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

