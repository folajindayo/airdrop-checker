import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/docs
 * API documentation endpoint with OpenAPI specification
 */
export async function GET(req: NextRequest) {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Airdrop Checker API',
      version: '1.0.0',
      description: 'API for checking airdrop eligibility and managing crypto portfolios',
      contact: {
        name: 'API Support',
        email: 'support@airdropchecker.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Version 1 API',
      },
    ],
    paths: {
      '/airdrops': {
        get: {
          summary: 'List all airdrops',
          description: 'Get a list of all available airdrops with optional filtering',
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['active', 'upcoming', 'ended'] },
              description: 'Filter by airdrop status',
            },
            {
              name: 'chain',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by blockchain',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 50 },
              description: 'Number of results to return',
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0 },
              description: 'Offset for pagination',
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          airdrops: { type: 'array', items: { type: 'object' } },
                          pagination: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/airdrops/check': {
        post: {
          summary: 'Check airdrop eligibility',
          description: 'Check if an address is eligible for airdrops',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    address: { type: 'string', description: 'Ethereum address' },
                    projects: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Optional list of specific projects to check',
                    },
                  },
                  required: ['address'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Eligibility check results',
            },
            '400': {
              description: 'Invalid request',
            },
          },
        },
      },
      '/portfolio/{address}': {
        get: {
          summary: 'Get portfolio for address',
          description: 'Retrieve detailed portfolio information for a specific address',
          parameters: [
            {
              name: 'address',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Ethereum address',
            },
            {
              name: 'includeHistory',
              in: 'query',
              schema: { type: 'boolean' },
              description: 'Include historical performance data',
            },
            {
              name: 'timeRange',
              in: 'query',
              schema: { type: 'string', default: '7d' },
              description: 'Time range for historical data',
            },
          ],
          responses: {
            '200': {
              description: 'Portfolio data',
            },
            '400': {
              description: 'Invalid address',
            },
          },
        },
      },
      '/transactions': {
        get: {
          summary: 'Get transactions',
          description: 'List transactions for an address',
          parameters: [
            {
              name: 'address',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Ethereum address',
            },
            {
              name: 'chain',
              in: 'query',
              schema: { type: 'string' },
              description: 'Blockchain network',
            },
            {
              name: 'type',
              in: 'query',
              schema: { type: 'string', enum: ['all', 'send', 'receive', 'swap', 'contract'] },
              description: 'Transaction type filter',
            },
          ],
          responses: {
            '200': {
              description: 'Transaction list',
            },
          },
        },
      },
      '/health': {
        get: {
          summary: 'Health check',
          description: 'Check API health status',
          responses: {
            '200': {
              description: 'API is healthy',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}

