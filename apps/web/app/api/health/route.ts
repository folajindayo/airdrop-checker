import { NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET() {
  try {
    const startTime = Date.now();

    // Check database connectivity
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await findAllProjects();
      dbResponseTime = Date.now() - dbStart;
      if (dbResponseTime > 1000) {
        dbStatus = 'degraded';
      }
    } catch (error) {
      dbStatus = 'unhealthy';
    }

    // Check external API (GoldRush)
    const apiStatus = process.env.GOLDRUSH_API_KEY ? 'configured' : 'not_configured';

    // Overall health
    const overallHealth = dbStatus === 'healthy' ? 'healthy' : dbStatus === 'degraded' ? 'degraded' : 'unhealthy';

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: overallHealth,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
        },
        api: {
          status: apiStatus,
        },
      },
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}



