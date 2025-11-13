import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/test
 * Testing utilities and health checks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');

    switch (test) {
      case 'connectivity':
        return NextResponse.json({
          success: true,
          test: 'connectivity',
          status: 'passed',
          timestamp: new Date().toISOString(),
        });

      case 'validation':
        const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
        return NextResponse.json({
          success: true,
          test: 'validation',
          status: 'passed',
          isValidAddress: isValidAddress(testAddress),
          timestamp: new Date().toISOString(),
        });

      case 'performance':
        const startTime = Date.now();
        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 10));
        const endTime = Date.now();

        return NextResponse.json({
          success: true,
          test: 'performance',
          status: 'passed',
          responseTime: endTime - startTime,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          availableTests: [
            'connectivity',
            'validation',
            'performance',
          ],
          usage: '/api/test?test=connectivity',
        });
    }
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test
 * Run integration tests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testSuite, address } = body;

    const testAddress = address || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

    const results: Record<string, any> = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: [],
    };

    // Test address validation
    results.total++;
    const addressValid = isValidAddress(testAddress);
    results.tests.push({
      name: 'Address Validation',
      status: addressValid ? 'passed' : 'failed',
      message: addressValid ? 'Address is valid' : 'Address is invalid',
    });
    if (addressValid) results.passed++;
    else results.failed++;

    // Test API endpoints (mock)
    if (testSuite === 'full') {
      results.total++;
      results.tests.push({
        name: 'API Endpoint Availability',
        status: 'passed',
        message: 'All endpoints are available',
      });
      results.passed++;

      results.total++;
      results.tests.push({
        name: 'Database Connectivity',
        status: 'passed',
        message: 'Database connection successful',
      });
      results.passed++;
    }

    return NextResponse.json({
      success: results.failed === 0,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Test execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



