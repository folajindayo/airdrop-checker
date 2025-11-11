import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PerformanceMetrics {
  api: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    requestsPerSecond: number;
  };
  database: {
    queryTime: number;
    connectionPool: number;
    activeConnections: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    totalSize: number;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    uptime: number;
  };
}

/**
 * GET /api/performance
 * Get performance metrics and monitoring data
 */
export async function GET() {
  try {
    // Mock performance data (in production, collect from actual monitoring)
    const metrics: PerformanceMetrics = {
      api: {
        averageResponseTime: 125, // ms
        totalRequests: 125000,
        errorRate: 0.02, // 2%
        requestsPerSecond: 45,
      },
      database: {
        queryTime: 15, // ms
        connectionPool: 10,
        activeConnections: 3,
      },
      cache: {
        hitRate: 0.85, // 85%
        missRate: 0.15,
        totalSize: 256, // MB
      },
      system: {
        memoryUsage: 512, // MB
        cpuUsage: 25, // %
        uptime: 86400, // seconds
      },
    };

    // Calculate health score
    const healthScore = Math.round(
      (1 - metrics.api.errorRate) * 40 +
      (metrics.cache.hitRate) * 30 +
      (metrics.api.averageResponseTime < 200 ? 1 : 0.5) * 20 +
      (metrics.system.cpuUsage < 80 ? 1 : 0.5) * 10
    );

    return NextResponse.json({
      success: true,
      metrics,
      healthScore,
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



