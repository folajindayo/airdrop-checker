import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/docs
 * Generate API documentation
 */
export async function GET() {
  const documentation = {
    version: '1.0.0',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://api.airdrop-finder.com',
    endpoints: [
      {
        path: '/api/airdrop-check/[address]',
        method: 'GET',
        description: 'Check airdrop eligibility for a wallet address',
        parameters: [
          { name: 'address', type: 'string', required: true, description: 'Ethereum wallet address' },
        ],
        response: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            overallScore: { type: 'number' },
            airdrops: { type: 'array' },
          },
        },
      },
      {
        path: '/api/portfolio/[address]',
        method: 'GET',
        description: 'Get portfolio value and token breakdown',
        parameters: [
          { name: 'address', type: 'string', required: true, description: 'Ethereum wallet address' },
        ],
        response: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            totalValue: { type: 'number' },
            chainBreakdown: { type: 'array' },
            topTokens: { type: 'array' },
          },
        },
      },
      {
        path: '/api/roi',
        method: 'POST',
        description: 'Calculate ROI for airdrop farming',
        parameters: [
          { name: 'address', type: 'string', required: true, description: 'Ethereum wallet address' },
          { name: 'gasPriceMultiplier', type: 'number', required: false, description: 'Gas price multiplier' },
        ],
        response: {
          type: 'object',
          properties: {
            totalGasSpent: { type: 'number' },
            potentialAirdropValue: { type: 'number' },
            roi: { type: 'number' },
          },
        },
      },
      {
        path: '/api/graphql',
        method: 'POST',
        description: 'GraphQL endpoint for flexible queries',
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'GraphQL query string' },
          { name: 'variables', type: 'object', required: false, description: 'Query variables' },
        ],
        response: {
          type: 'object',
          properties: {
            data: { type: 'object' },
            errors: { type: 'array' },
          },
        },
      },
      {
        path: '/api/filter',
        method: 'POST',
        description: 'Advanced filtering and aggregation',
        parameters: [
          { name: 'filters', type: 'object', required: false },
          { name: 'aggregations', type: 'object', required: false },
          { name: 'sort', type: 'object', required: false },
          { name: 'limit', type: 'number', required: false },
          { name: 'offset', type: 'number', required: false },
        ],
        response: {
          type: 'object',
          properties: {
            results: { type: 'array' },
            pagination: { type: 'object' },
            aggregations: { type: 'object' },
          },
        },
      },
    ],
    authentication: {
      type: 'API Key',
      header: 'Authorization: Bearer <api_key>',
      description: 'Some endpoints require API key authentication',
    },
    rateLimits: {
      default: '1000 requests per day',
      endpoints: {
        '/api/airdrop-check': '100 requests per hour',
        '/api/refresh': '10 requests per 5 minutes',
        '/api/batch': '20 requests per hour',
      },
    },
    errorCodes: {
      400: 'Bad Request - Invalid parameters',
      401: 'Unauthorized - Invalid or missing API key',
      403: 'Forbidden - IP not whitelisted',
      404: 'Not Found - Resource not found',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    },
    examples: {
      curl: {
        airdropCheck: 'curl -X GET "https://api.airdrop-finder.com/api/airdrop-check/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"',
        portfolio: 'curl -X GET "https://api.airdrop-finder.com/api/portfolio/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"',
        roi: 'curl -X POST "https://api.airdrop-finder.com/api/roi" -H "Content-Type: application/json" -d \'{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}\'',
      },
      javascript: {
        airdropCheck: `
fetch('https://api.airdrop-finder.com/api/airdrop-check/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
  .then(res => res.json())
  .then(data => console.log(data));
        `,
      },
    },
  };

  return NextResponse.json({
    success: true,
    documentation,
    generatedAt: new Date().toISOString(),
  });
}



