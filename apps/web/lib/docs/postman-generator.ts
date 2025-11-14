/**
 * @fileoverview Postman collection generator
 * @module lib/docs/postman-generator
 */

/**
 * Postman collection structure (v2.1)
 */
export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    version: string;
    schema: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
  auth?: PostmanAuth;
}

export interface PostmanItem {
  name: string;
  description?: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
  response?: PostmanResponse[];
}

export interface PostmanRequest {
  method: string;
  header?: Array<{ key: string; value: string; description?: string }>;
  url: PostmanURL;
  body?: PostmanBody;
  auth?: PostmanAuth;
  description?: string;
}

export interface PostmanURL {
  raw: string;
  host: string[];
  path: string[];
  query?: Array<{ key: string; value: string; description?: string }>;
  variable?: PostmanVariable[];
}

export interface PostmanBody {
  mode: 'raw' | 'urlencoded' | 'formdata' | 'binary' | 'graphql';
  raw?: string;
  options?: {
    raw?: {
      language: string;
    };
  };
}

export interface PostmanResponse {
  name: string;
  originalRequest: PostmanRequest;
  status: string;
  code: number;
  _postman_previewlanguage?: string;
  header: Array<{ key: string; value: string }>;
  cookie: any[];
  body: string;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
  description?: string;
}

export interface PostmanAuth {
  type: string;
  bearer?: Array<{ key: string; value: string; type: string }>;
  apikey?: Array<{ key: string; value: string; type: string }>;
}

/**
 * Generate Postman collection for the API
 */
export function generatePostmanCollection(): PostmanCollection {
  return {
    info: {
      name: 'Airdrop Checker API',
      description: 'Complete API collection for the Airdrop Checker platform',
      version: '1.0.0',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:3000',
        type: 'string',
        description: 'Base URL for the API',
      },
      {
        key: 'apiKey',
        value: 'your-api-key-here',
        type: 'string',
        description: 'API key for authentication',
      },
      {
        key: 'walletAddress',
        value: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        type: 'string',
        description: 'Sample wallet address for testing',
      },
    ],
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{apiKey}}',
          type: 'string',
        },
      ],
    },
    item: [
      {
        name: 'Airdrops',
        description: 'Endpoints for airdrop management and eligibility checking',
        item: [
          {
            name: 'Check Airdrop Eligibility',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/airdrop-check/:address',
                host: ['{{baseUrl}}'],
                path: ['api', 'airdrop-check', ':address'],
                variable: [
                  {
                    key: 'address',
                    value: '{{walletAddress}}',
                    description: 'Ethereum wallet address to check',
                  },
                ],
              },
              description: 'Check if a wallet address is eligible for any active airdrops',
            },
            response: [
              {
                name: 'Success Response',
                originalRequest: {} as any,
                status: 'OK',
                code: 200,
                _postman_previewlanguage: 'json',
                header: [
                  { key: 'Content-Type', value: 'application/json' },
                ],
                cookie: [],
                body: JSON.stringify(
                  {
                    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                    eligible: true,
                    airdrops: [
                      {
                        id: 'project-123',
                        name: 'Example Project',
                        status: 'active',
                        eligibilityScore: 85.5,
                      },
                    ],
                    score: 85.5,
                  },
                  null,
                  2
                ),
              },
            ],
          },
          {
            name: 'List All Airdrops',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/airdrops?status=active&limit=20',
                host: ['{{baseUrl}}'],
                path: ['api', 'airdrops'],
                query: [
                  {
                    key: 'status',
                    value: 'active',
                    description: 'Filter by airdrop status (active, upcoming, ended, all)',
                  },
                  {
                    key: 'limit',
                    value: '20',
                    description: 'Maximum number of results (1-100)',
                  },
                  {
                    key: 'offset',
                    value: '0',
                    description: 'Offset for pagination',
                  },
                ],
              },
              description: 'Get a list of all tracked airdrop projects with optional filtering',
            },
            response: [
              {
                name: 'Success Response',
                originalRequest: {} as any,
                status: 'OK',
                code: 200,
                _postman_previewlanguage: 'json',
                header: [
                  { key: 'Content-Type', value: 'application/json' },
                ],
                cookie: [],
                body: JSON.stringify(
                  {
                    airdrops: [
                      {
                        id: 'project-123',
                        name: 'Example Project',
                        status: 'active',
                        totalValue: 1000000,
                      },
                    ],
                    total: 42,
                    limit: 20,
                    offset: 0,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        ],
      },
      {
        name: 'Portfolio',
        description: 'Endpoints for wallet portfolio analysis',
        item: [
          {
            name: 'Get Portfolio Data',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/portfolio/:address',
                host: ['{{baseUrl}}'],
                path: ['api', 'portfolio', ':address'],
                variable: [
                  {
                    key: 'address',
                    value: '{{walletAddress}}',
                    description: 'Wallet address to analyze',
                  },
                ],
              },
              description: 'Get comprehensive portfolio data for a wallet address',
            },
            response: [
              {
                name: 'Success Response',
                originalRequest: {} as any,
                status: 'OK',
                code: 200,
                _postman_previewlanguage: 'json',
                header: [
                  { key: 'Content-Type', value: 'application/json' },
                ],
                cookie: [],
                body: JSON.stringify(
                  {
                    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                    totalValue: 25000.5,
                    chainBreakdown: [
                      {
                        chain: 'ethereum',
                        value: 15000,
                        tokens: 5,
                      },
                    ],
                  },
                  null,
                  2
                ),
              },
            ],
          },
        ],
      },
      {
        name: 'Gas Tracking',
        description: 'Endpoints for gas price tracking',
        item: [
          {
            name: 'Get Gas Tracker Data',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/gas-tracker/:address',
                host: ['{{baseUrl}}'],
                path: ['api', 'gas-tracker', ':address'],
                variable: [
                  {
                    key: 'address',
                    value: '{{walletAddress}}',
                    description: 'Wallet address to track',
                  },
                ],
              },
              description: 'Get current gas prices and historical data for a wallet',
            },
            response: [
              {
                name: 'Success Response',
                originalRequest: {} as any,
                status: 'OK',
                code: 200,
                _postman_previewlanguage: 'json',
                header: [
                  { key: 'Content-Type', value: 'application/json' },
                ],
                cookie: [],
                body: JSON.stringify(
                  {
                    currentGasPrice: {
                      low: 25,
                      medium: 35,
                      high: 50,
                    },
                    totalGasSpent: 1250.5,
                    transactionCount: 150,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        ],
      },
      {
        name: 'Trending',
        description: 'Endpoints for trending projects',
        item: [
          {
            name: 'Get Trending Projects',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trending?limit=10&timeframe=24h',
                host: ['{{baseUrl}}'],
                path: ['api', 'trending'],
                query: [
                  {
                    key: 'limit',
                    value: '10',
                    description: 'Maximum number of results (1-50)',
                  },
                  {
                    key: 'timeframe',
                    value: '24h',
                    description: 'Timeframe for trending calculation (1h, 24h, 7d, 30d)',
                  },
                ],
              },
              description: 'Get a list of currently trending cryptocurrency projects',
            },
            response: [
              {
                name: 'Success Response',
                originalRequest: {} as any,
                status: 'OK',
                code: 200,
                _postman_previewlanguage: 'json',
                header: [
                  { key: 'Content-Type', value: 'application/json' },
                ],
                cookie: [],
                body: JSON.stringify(
                  {
                    projects: [
                      {
                        id: 'project-123',
                        name: 'Trending Project',
                        change24h: 15.5,
                        volume: 5000000,
                      },
                    ],
                    timeframe: '24h',
                  },
                  null,
                  2
                ),
              },
            ],
          },
        ],
      },
      {
        name: 'System',
        description: 'System endpoints for health and status',
        item: [
          {
            name: 'Health Check',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/health',
                host: ['{{baseUrl}}'],
                path: ['api', 'health'],
              },
              description: 'Check API health and service status',
            },
            response: [
              {
                name: 'Healthy',
                originalRequest: {} as any,
                status: 'OK',
                code: 200,
                _postman_previewlanguage: 'json',
                header: [
                  { key: 'Content-Type', value: 'application/json' },
                ],
                cookie: [],
                body: JSON.stringify(
                  {
                    status: 'healthy',
                    timestamp: '2024-01-01T00:00:00Z',
                    services: {
                      database: { status: 'healthy', latency: 5 },
                      cache: { status: 'healthy', latency: 2 },
                    },
                  },
                  null,
                  2
                ),
              },
            ],
          },
          {
            name: 'Rate Limit Status',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/rate-limit',
                host: ['{{baseUrl}}'],
                path: ['api', 'rate-limit'],
              },
              description: 'Get current rate limit information',
            },
            response: [
              {
                name: 'Success Response',
                originalRequest: {} as any,
                status: 'OK',
                code: 200,
                _postman_previewlanguage: 'json',
                header: [
                  { key: 'Content-Type', value: 'application/json' },
                ],
                cookie: [],
                body: JSON.stringify(
                  {
                    limit: 100,
                    remaining: 95,
                    reset: 1640000000,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Postman collection as JSON string
 */
export function generatePostmanJSON(): string {
  return JSON.stringify(generatePostmanCollection(), null, 2);
}

/**
 * Generate Postman environment
 */
export function generatePostmanEnvironment(): {
  name: string;
  values: Array<{ key: string; value: string; enabled: boolean }>;
} {
  return {
    name: 'Airdrop Checker API - Development',
    values: [
      {
        key: 'baseUrl',
        value: 'http://localhost:3000',
        enabled: true,
      },
      {
        key: 'apiKey',
        value: 'your-api-key-here',
        enabled: true,
      },
      {
        key: 'walletAddress',
        value: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        enabled: true,
      },
    ],
  };
}

