/**
 * @fileoverview Test data generator utilities
 * 
 * Comprehensive utilities for generating test data
 */

/**
 * Generate random string
 */
export function randomString(length = 10, charset = 'abcdefghijklmnopqrstuvwxyz'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Generate random number in range
 */
export function randomNumber(min = 0, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random boolean
 */
export function randomBoolean(): boolean {
  return Math.random() < 0.5;
}

/**
 * Generate random date
 */
export function randomDate(start = new Date(2020, 0, 1), end = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate random email
 */
export function randomEmail(domain = 'example.com'): string {
  const username = randomString(10);
  return `${username}@${domain}`;
}

/**
 * Generate random Ethereum address
 */
export function randomEthereumAddress(): string {
  return '0x' + randomString(40, '0123456789abcdef');
}

/**
 * Generate random transaction hash
 */
export function randomTransactionHash(): string {
  return '0x' + randomString(64, '0123456789abcdef');
}

/**
 * Generate random UUID
 */
export function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Pick random item from array
 */
export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Pick multiple random items from array
 */
export function pickRandomMultiple<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate mock user
 */
export interface MockUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export function mockUser(overrides?: Partial<MockUser>): MockUser {
  const firstName = pickRandom(['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana']);
  const lastName = pickRandom(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']);
  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${randomNumber(1, 99)}`;

  return {
    id: randomUUID(),
    email: `${username}@example.com`,
    username,
    firstName,
    lastName,
    createdAt: randomDate(),
    updatedAt: new Date(),
    isActive: randomBoolean(),
    ...overrides,
  };
}

/**
 * Generate mock wallet
 */
export interface MockWallet {
  address: string;
  ensName?: string;
  balance: string;
  chainId: number;
}

export function mockWallet(overrides?: Partial<MockWallet>): MockWallet {
  return {
    address: randomEthereumAddress(),
    balance: (Math.random() * 100).toFixed(4),
    chainId: pickRandom([1, 137, 56, 43114, 42161]),
    ...overrides,
  };
}

/**
 * Generate mock transaction
 */
export interface MockTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice?: string;
  gasLimit?: string;
  nonce: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export function mockTransaction(overrides?: Partial<MockTransaction>): MockTransaction {
  return {
    hash: randomTransactionHash(),
    from: randomEthereumAddress(),
    to: randomEthereumAddress(),
    value: (Math.random() * 10).toFixed(6),
    gasPrice: (Math.random() * 100).toFixed(9),
    gasLimit: randomNumber(21000, 100000).toString(),
    nonce: randomNumber(0, 1000),
    timestamp: randomDate().getTime(),
    status: pickRandom(['pending', 'confirmed', 'failed']),
    ...overrides,
  };
}

/**
 * Generate mock token
 */
export interface MockToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUSD?: number;
  priceUSD?: number;
  change24h?: number;
}

export function mockToken(overrides?: Partial<MockToken>): MockToken {
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'DAI', name: 'Dai' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
  ];

  const token = pickRandom(tokens);
  const balance = (Math.random() * 1000).toFixed(4);
  const priceUSD = Math.random() * 5000;
  const balanceUSD = parseFloat(balance) * priceUSD;

  return {
    address: randomEthereumAddress(),
    symbol: token.symbol,
    name: token.name,
    decimals: 18,
    balance,
    balanceUSD,
    priceUSD,
    change24h: (Math.random() * 20) - 10,
    ...overrides,
  };
}

/**
 * Generate mock airdrop
 */
export interface MockAirdrop {
  id: string;
  projectName: string;
  tokenSymbol: string;
  allocation: number;
  allocationUSD?: number;
  eligibilityCriteria: string[];
  claimDeadline: Date;
  status: 'pending' | 'eligible' | 'claimed' | 'expired';
}

export function mockAirdrop(overrides?: Partial<MockAirdrop>): MockAirdrop {
  const projects = [
    'Uniswap', 'Arbitrum', 'Optimism', 'Polygon', 'Avalanche',
    'Starknet', 'zkSync', 'LayerZero', 'Celestia', 'Dymension'
  ];

  const criteria = [
    'Hold at least 0.1 ETH',
    'Completed 10+ transactions',
    'Wallet age > 6 months',
    'Interacted with protocol',
    'Participated in governance',
  ];

  const allocation = randomNumber(100, 10000);
  const pricePerToken = Math.random() * 10;

  return {
    id: randomUUID(),
    projectName: pickRandom(projects),
    tokenSymbol: pickRandom(projects).slice(0, 4).toUpperCase(),
    allocation,
    allocationUSD: allocation * pricePerToken,
    eligibilityCriteria: pickRandomMultiple(criteria, randomNumber(2, 4)),
    claimDeadline: randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
    status: pickRandom(['pending', 'eligible', 'claimed', 'expired']),
    ...overrides,
  };
}

/**
 * Generate mock API response
 */
export interface MockAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

export function mockAPIResponse<T>(
  data?: T,
  success = true
): MockAPIResponse<T> {
  if (success) {
    return {
      success: true,
      data,
      timestamp: Date.now(),
    };
  }

  return {
    success: false,
    error: {
      code: 'ERROR_CODE',
      message: 'An error occurred',
    },
    timestamp: Date.now(),
  };
}

/**
 * Generate array of mock items
 */
export function mockArray<T>(
  generator: (index: number) => T,
  count = 10
): T[] {
  return Array.from({ length: count }, (_, i) => generator(i));
}

/**
 * Generate paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function mockPaginatedResponse<T>(
  items: T[],
  page = 1,
  pageSize = 10
): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    hasMore: end < items.length,
  };
}

/**
 * Wait for specified time (for async tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate mock error
 */
export function mockError(message = 'Test error', code = 'TEST_ERROR'): Error {
  const error = new Error(message);
  (error as any).code = code;
  return error;
}

/**
 * Example usage:
 * 
 * // Generate single items
 * const user = mockUser();
 * const wallet = mockWallet();
 * const transaction = mockTransaction();
 * 
 * // Generate arrays
 * const users = mockArray(() => mockUser(), 10);
 * const tokens = mockArray(() => mockToken(), 5);
 * 
 * // Generate paginated data
 * const allUsers = mockArray(() => mockUser(), 50);
 * const page1 = mockPaginatedResponse(allUsers, 1, 10);
 * 
 * // Generate API response
 * const response = mockAPIResponse(mockUser());
 */

