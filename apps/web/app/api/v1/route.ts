import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1
 * API version information and available endpoints
 */
export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    status: 'stable',
    endpoints: {
      airdropCheck: '/api/v1/airdrop-check/[address]',
      portfolio: '/api/v1/portfolio/[address]',
      airdrops: '/api/v1/airdrops',
      compare: '/api/v1/compare',
      calendar: '/api/v1/calendar',
      stats: '/api/v1/stats',
      trending: '/api/v1/trending',
      opportunities: '/api/v1/opportunities/[address]',
      insights: '/api/v1/insights/[address]',
      riskAnalyzer: '/api/v1/risk-analyzer/[address]',
      roi: '/api/v1/roi',
      contracts: '/api/v1/contracts/[address]',
      gasTracker: '/api/v1/gas-tracker/[address]',
      history: '/api/v1/history/[address]',
      export: '/api/v1/export/[address]',
      share: '/api/v1/share',
      webhooks: '/api/v1/webhooks',
      notifications: '/api/v1/notifications',
      batch: '/api/v1/batch',
      search: '/api/v1/search',
      usage: '/api/v1/usage/[address]',
      predict: '/api/v1/predict',
      realtime: '/api/v1/realtime/[address]',
      performance: '/api/v1/performance',
      backup: '/api/v1/backup/[address]',
      analytics: '/api/v1/analytics',
      integrations: {
        discord: '/api/v1/integrations/discord',
        telegram: '/api/v1/integrations/telegram',
      },
      email: '/api/v1/notifications/email',
      reports: '/api/v1/reports/[address]',
      cache: '/api/v1/cache',
      health: '/api/v1/health',
    },
    changelog: [
      {
        version: '1.0.0',
        date: '2024-01-01',
        changes: [
          'Initial API release',
          'Core airdrop checking functionality',
          'Portfolio tracking',
          'Multi-chain support',
        ],
      },
    ],
    documentation: 'https://docs.airdrop-finder.com/api/v1',
    support: 'https://support.airdrop-finder.com',
  });
}



