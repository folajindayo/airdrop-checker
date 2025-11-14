/**
 * @fileoverview OpenAPI documentation generator
 * @module lib/docs/openapi-generator
 */

import { OpenAPIV3 } from 'openapi-types';

/**
 * Base OpenAPI document structure
 */
const baseDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Airdrop Checker API',
    version: '1.0.0',
    description: `
# Airdrop Checker API

A comprehensive API for tracking cryptocurrency airdrops, portfolio analysis, and blockchain data.

## Features

- **Airdrop Tracking**: Check eligibility and track airdrop campaigns
- **Portfolio Management**: Analyze wallet holdings across multiple chains
- **Gas Tracking**: Monitor gas prices and transaction costs
- **Trending Analysis**: Track trending tokens and projects
- **Multi-chain Support**: Support for Ethereum, Polygon, BSC, and more

## Authentication

Most endpoints require API key authentication. Include your API key in the \`Authorization\` header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Rate Limiting

API requests are rate limited to 100 requests per minute per IP address.
Rate limit information is included in response headers:

- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Requests remaining
- \`X-RateLimit-Reset\`: Timestamp when limit resets

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
\`\`\`
    `,
    contact: {
      name: 'API Support',
      email: 'support@airdropchecker.com',
      url: 'https://airdropchecker.com/support',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://api.airdropchecker.com',
      description: 'Production server',
    },
    {
      url: 'https://staging-api.airdropchecker.com',
      description: 'Staging server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Airdrops',
      description: 'Airdrop tracking and eligibility checking',
    },
    {
      name: 'Portfolio',
      description: 'Wallet portfolio analysis and tracking',
    },
    {
      name: 'Gas',
      description: 'Gas price tracking and estimation',
    },
    {
      name: 'Trending',
      description: 'Trending tokens and projects',
    },
    {
      name: 'Health',
      description: 'API health and status endpoints',
    },
    {
      name: 'Rate Limiting',
      description: 'Rate limit information',
    },
  ],
  paths: {
    '/api/airdrop-check/{address}': {
      get: {
        tags: ['Airdrops'],
        summary: 'Check airdrop eligibility',
        description: 'Check if a wallet address is eligible for any active airdrops',
        operationId: 'checkAirdropEligibility',
        parameters: [
          {
            name: 'address',
            in: 'path',
            required: true,
            description: 'Ethereum wallet address',
            schema: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AirdropCheckResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '429': {
            $ref: '#/components/responses/TooManyRequests',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/airdrops': {
      get: {
        tags: ['Airdrops'],
        summary: 'List all airdrops',
        description: 'Get a list of all tracked airdrop projects',
        operationId: 'listAirdrops',
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            description: 'Filter by airdrop status',
            schema: {
              type: 'string',
              enum: ['active', 'upcoming', 'ended', 'all'],
              default: 'all',
            },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of results',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
          {
            name: 'offset',
            in: 'query',
            required: false,
            description: 'Offset for pagination',
            schema: {
              type: 'integer',
              minimum: 0,
              default: 0,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AirdropsListResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/portfolio/{address}': {
      get: {
        tags: ['Portfolio'],
        summary: 'Get wallet portfolio',
        description: 'Get comprehensive portfolio data for a wallet address',
        operationId: 'getPortfolio',
        parameters: [
          {
            name: 'address',
            in: 'path',
            required: true,
            description: 'Wallet address',
            schema: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PortfolioResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/gas-tracker/{address}': {
      get: {
        tags: ['Gas'],
        summary: 'Track gas prices',
        description: 'Get current gas prices and historical data for a wallet',
        operationId: 'trackGas',
        parameters: [
          {
            name: 'address',
            in: 'path',
            required: true,
            description: 'Wallet address',
            schema: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/GasTrackerResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/trending': {
      get: {
        tags: ['Trending'],
        summary: 'Get trending projects',
        description: 'Get a list of currently trending cryptocurrency projects',
        operationId: 'getTrending',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of results',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 50,
              default: 10,
            },
          },
          {
            name: 'timeframe',
            in: 'query',
            required: false,
            description: 'Timeframe for trending calculation',
            schema: {
              type: 'string',
              enum: ['1h', '24h', '7d', '30d'],
              default: '24h',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TrendingResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Check API health and service status',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
          '503': {
            description: 'Service is unhealthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/rate-limit': {
      get: {
        tags: ['Rate Limiting'],
        summary: 'Check rate limit status',
        description: 'Get current rate limit information for your API key or IP',
        operationId: 'getRateLimitStatus',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RateLimitResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authentication',
      },
    },
    schemas: {
      AirdropCheckResponse: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
            example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          },
          eligible: {
            type: 'boolean',
            example: true,
          },
          airdrops: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Airdrop',
            },
          },
          score: {
            type: 'number',
            example: 85.5,
          },
        },
        required: ['address', 'eligible', 'airdrops'],
      },
      AirdropsListResponse: {
        type: 'object',
        properties: {
          airdrops: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Airdrop',
            },
          },
          total: {
            type: 'integer',
            example: 42,
          },
          limit: {
            type: 'integer',
            example: 20,
          },
          offset: {
            type: 'integer',
            example: 0,
          },
        },
        required: ['airdrops', 'total', 'limit', 'offset'],
      },
      Airdrop: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'project-123',
          },
          name: {
            type: 'string',
            example: 'Example Project',
          },
          status: {
            type: 'string',
            enum: ['active', 'upcoming', 'ended'],
            example: 'active',
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00Z',
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            example: '2024-12-31T23:59:59Z',
          },
          totalValue: {
            type: 'number',
            example: 1000000,
          },
          eligibilityCriteria: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['Hold 100+ tokens', 'Active for 30+ days'],
          },
        },
        required: ['id', 'name', 'status'],
      },
      PortfolioResponse: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
          },
          totalValue: {
            type: 'number',
          },
          chainBreakdown: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                chain: {
                  type: 'string',
                },
                value: {
                  type: 'number',
                },
                tokens: {
                  type: 'integer',
                },
              },
            },
          },
          tokens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                },
                balance: {
                  type: 'string',
                },
                value: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
      GasTrackerResponse: {
        type: 'object',
        properties: {
          currentGasPrice: {
            type: 'object',
            properties: {
              low: {
                type: 'number',
              },
              medium: {
                type: 'number',
              },
              high: {
                type: 'number',
              },
            },
          },
          totalGasSpent: {
            type: 'number',
          },
          transactionCount: {
            type: 'integer',
          },
        },
      },
      TrendingResponse: {
        type: 'object',
        properties: {
          projects: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
                change24h: {
                  type: 'number',
                },
                volume: {
                  type: 'number',
                },
              },
            },
          },
          timeframe: {
            type: 'string',
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy'],
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
          services: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                },
                latency: {
                  type: 'number',
                },
              },
            },
          },
        },
        required: ['status', 'timestamp'],
      },
      RateLimitResponse: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            example: 100,
          },
          remaining: {
            type: 'integer',
            example: 95,
          },
          reset: {
            type: 'integer',
            example: 1640000000,
          },
        },
        required: ['limit', 'remaining', 'reset'],
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'INVALID_ADDRESS',
              },
              message: {
                type: 'string',
                example: 'Invalid Ethereum address format',
              },
              details: {
                type: 'object',
              },
            },
            required: ['code', 'message'],
          },
        },
        required: ['error'],
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      TooManyRequests: {
        description: 'Too Many Requests',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
        headers: {
          'X-RateLimit-Limit': {
            description: 'Request limit per time window',
            schema: {
              type: 'integer',
            },
          },
          'X-RateLimit-Remaining': {
            description: 'Remaining requests in current window',
            schema: {
              type: 'integer',
            },
          },
          'X-RateLimit-Reset': {
            description: 'Time when rate limit resets (Unix timestamp)',
            schema: {
              type: 'integer',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
    {
      apiKey: [],
    },
  ],
};

/**
 * Get the OpenAPI documentation
 */
export function getOpenAPIDocument(): OpenAPIV3.Document {
  return baseDocument;
}

/**
 * Generate OpenAPI documentation as JSON
 */
export function generateOpenAPIJSON(): string {
  return JSON.stringify(baseDocument, null, 2);
}

/**
 * Generate OpenAPI documentation as YAML
 */
export function generateOpenAPIYAML(): string {
  // Basic YAML generation (for production, use a library like js-yaml)
  return JSON.stringify(baseDocument, null, 2);
}

