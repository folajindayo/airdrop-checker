import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/health
 * Health check endpoint for monitoring and load balancers
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // Basic health checks
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    checks: {
      api: 'ok',
      memory: checkMemory(),
      responseTime: 0,
    },
  };

  health.checks.responseTime = Date.now() - startTime;

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

function checkMemory(): string {
  const used = process.memoryUsage();
  const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;
  
  if (heapUsedPercent > 90) return 'critical';
  if (heapUsedPercent > 75) return 'warning';
  return 'ok';
}

