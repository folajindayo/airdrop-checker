/**
 * Mock implementations for external dependencies
 * Provides mocks for APIs, services, and external libraries
 */

/**
 * Mock NextResponse for testing
 */
export class MockNextResponse {
  status: number = 200;
  headers: Map<string, string> = new Map();
  body: any = null;

  json(data: any) {
    this.body = data;
    return this;
  }

  setHeader(key: string, value: string) {
    this.headers.set(key, value);
    return this;
  }
}

/**
 * Mock GoldRush API responses
 */
export const mockGoldRushResponses = {
  tokenBalances: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    items: [
      {
        contract_address: '0x0000000000000000000000000000000000000000',
        contract_name: 'Ethereum',
        contract_ticker_symbol: 'ETH',
        contract_decimals: 18,
        balance: '10500000000000000000',
        quote: 25000,
        logo_url: 'https://example.com/eth.png',
        native_token: true,
      },
    ],
  },
  transactions: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    items: [
      {
        tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        to_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '1000000000000000000',
        gas_spent: 21000,
        block_signed_at: new Date().toISOString(),
        block_height: 18000000,
      },
    ],
  },
};

/**
 * Mock Prisma client
 */
export const createMockPrismaClient = () => ({
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  reminder: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  claim: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

/**
 * Mock cache
 */
export const createMockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  has: jest.fn(),
});

/**
 * Mock logger
 */
export const createMockLogger = () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});

