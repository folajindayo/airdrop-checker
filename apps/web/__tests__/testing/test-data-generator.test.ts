/**
 * @fileoverview Tests for test data generator
 */

import {
  randomString,
  randomNumber,
  randomBoolean,
  randomDate,
  randomEmail,
  randomEthereumAddress,
  randomTransactionHash,
  randomUUID,
  pickRandom,
  pickRandomMultiple,
  shuffle,
  mockUser,
  mockWallet,
  mockTransaction,
  mockToken,
  mockAirdrop,
  mockAPIResponse,
  mockArray,
  mockPaginatedResponse,
  wait,
  mockError,
} from '@/lib/testing/test-data-generator';

describe('Test Data Generator', () => {
  describe('Random Generators', () => {
    describe('randomString', () => {
      it('should generate string with default length', () => {
        const result = randomString();
        expect(typeof result).toBe('string');
        expect(result.length).toBe(10);
      });

      it('should generate string with custom length', () => {
        const result = randomString(20);
        expect(result.length).toBe(20);
      });

      it('should generate string with custom charset', () => {
        const result = randomString(10, '0123456789');
        expect(/^[0-9]+$/.test(result)).toBe(true);
      });
    });

    describe('randomNumber', () => {
      it('should generate number in default range', () => {
        const result = randomNumber();
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(100);
      });

      it('should generate number in custom range', () => {
        const result = randomNumber(50, 75);
        expect(result).toBeGreaterThanOrEqual(50);
        expect(result).toBeLessThanOrEqual(75);
      });

      it('should generate integer', () => {
        const result = randomNumber();
        expect(Number.isInteger(result)).toBe(true);
      });
    });

    describe('randomBoolean', () => {
      it('should generate boolean', () => {
        const result = randomBoolean();
        expect(typeof result).toBe('boolean');
      });

      it('should generate both true and false (statistically)', () => {
        const results = Array.from({ length: 100 }, () => randomBoolean());
        const hasTrue = results.includes(true);
        const hasFalse = results.includes(false);
        expect(hasTrue && hasFalse).toBe(true);
      });
    });

    describe('randomDate', () => {
      it('should generate date between defaults', () => {
        const result = randomDate();
        const start = new Date(2020, 0, 1);
        const end = new Date();
        expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
      });

      it('should generate date in custom range', () => {
        const start = new Date(2023, 0, 1);
        const end = new Date(2023, 11, 31);
        const result = randomDate(start, end);
        expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
      });
    });

    describe('randomEmail', () => {
      it('should generate valid email', () => {
        const result = randomEmail();
        expect(result).toMatch(/^[a-z]+@example\.com$/);
      });

      it('should generate email with custom domain', () => {
        const result = randomEmail('test.com');
        expect(result).toMatch(/^[a-z]+@test\.com$/);
      });
    });

    describe('randomEthereumAddress', () => {
      it('should generate valid Ethereum address', () => {
        const result = randomEthereumAddress();
        expect(result).toMatch(/^0x[a-f0-9]{40}$/);
      });

      it('should generate unique addresses', () => {
        const addr1 = randomEthereumAddress();
        const addr2 = randomEthereumAddress();
        expect(addr1).not.toBe(addr2);
      });
    });

    describe('randomTransactionHash', () => {
      it('should generate valid transaction hash', () => {
        const result = randomTransactionHash();
        expect(result).toMatch(/^0x[a-f0-9]{64}$/);
      });
    });

    describe('randomUUID', () => {
      it('should generate valid UUID v4', () => {
        const result = randomUUID();
        expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      });

      it('should generate unique UUIDs', () => {
        const uuid1 = randomUUID();
        const uuid2 = randomUUID();
        expect(uuid1).not.toBe(uuid2);
      });
    });
  });

  describe('Array Utilities', () => {
    describe('pickRandom', () => {
      it('should pick item from array', () => {
        const array = [1, 2, 3, 4, 5];
        const result = pickRandom(array);
        expect(array).toContain(result);
      });

      it('should return single item for single-item array', () => {
        const result = pickRandom([42]);
        expect(result).toBe(42);
      });
    });

    describe('pickRandomMultiple', () => {
      it('should pick specified number of items', () => {
        const array = [1, 2, 3, 4, 5];
        const result = pickRandomMultiple(array, 3);
        expect(result.length).toBe(3);
      });

      it('should not pick more items than available', () => {
        const array = [1, 2, 3];
        const result = pickRandomMultiple(array, 10);
        expect(result.length).toBe(3);
      });

      it('should pick unique items', () => {
        const array = [1, 2, 3, 4, 5];
        const result = pickRandomMultiple(array, 3);
        const unique = new Set(result);
        expect(unique.size).toBe(result.length);
      });
    });

    describe('shuffle', () => {
      it('should return array with same length', () => {
        const array = [1, 2, 3, 4, 5];
        const result = shuffle(array);
        expect(result.length).toBe(array.length);
      });

      it('should contain all original items', () => {
        const array = [1, 2, 3, 4, 5];
        const result = shuffle(array);
        expect(result.sort()).toEqual(array.sort());
      });

      it('should not modify original array', () => {
        const array = [1, 2, 3, 4, 5];
        const original = [...array];
        shuffle(array);
        expect(array).toEqual(original);
      });
    });
  });

  describe('Mock Objects', () => {
    describe('mockUser', () => {
      it('should generate user with all required fields', () => {
        const user = mockUser();
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
        expect(user).toHaveProperty('isActive');
      });

      it('should generate valid UUID for id', () => {
        const user = mockUser();
        expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      });

      it('should apply overrides', () => {
        const user = mockUser({ username: 'custom_user' });
        expect(user.username).toBe('custom_user');
      });
    });

    describe('mockWallet', () => {
      it('should generate wallet with all required fields', () => {
        const wallet = mockWallet();
        expect(wallet).toHaveProperty('address');
        expect(wallet).toHaveProperty('balance');
        expect(wallet).toHaveProperty('chainId');
      });

      it('should generate valid Ethereum address', () => {
        const wallet = mockWallet();
        expect(wallet.address).toMatch(/^0x[a-f0-9]{40}$/);
      });

      it('should apply overrides', () => {
        const wallet = mockWallet({ chainId: 137 });
        expect(wallet.chainId).toBe(137);
      });
    });

    describe('mockTransaction', () => {
      it('should generate transaction with all required fields', () => {
        const tx = mockTransaction();
        expect(tx).toHaveProperty('hash');
        expect(tx).toHaveProperty('from');
        expect(tx).toHaveProperty('to');
        expect(tx).toHaveProperty('value');
        expect(tx).toHaveProperty('nonce');
        expect(tx).toHaveProperty('timestamp');
        expect(tx).toHaveProperty('status');
      });

      it('should generate valid transaction hash', () => {
        const tx = mockTransaction();
        expect(tx.hash).toMatch(/^0x[a-f0-9]{64}$/);
      });

      it('should generate valid status', () => {
        const tx = mockTransaction();
        expect(['pending', 'confirmed', 'failed']).toContain(tx.status);
      });
    });

    describe('mockToken', () => {
      it('should generate token with all required fields', () => {
        const token = mockToken();
        expect(token).toHaveProperty('address');
        expect(token).toHaveProperty('symbol');
        expect(token).toHaveProperty('name');
        expect(token).toHaveProperty('decimals');
        expect(token).toHaveProperty('balance');
      });

      it('should have valid token address', () => {
        const token = mockToken();
        expect(token.address).toMatch(/^0x[a-f0-9]{40}$/);
      });

      it('should calculate balanceUSD correctly', () => {
        const token = mockToken();
        if (token.balanceUSD && token.priceUSD) {
          const expected = parseFloat(token.balance) * token.priceUSD;
          expect(token.balanceUSD).toBeCloseTo(expected, 2);
        }
      });
    });

    describe('mockAirdrop', () => {
      it('should generate airdrop with all required fields', () => {
        const airdrop = mockAirdrop();
        expect(airdrop).toHaveProperty('id');
        expect(airdrop).toHaveProperty('projectName');
        expect(airdrop).toHaveProperty('tokenSymbol');
        expect(airdrop).toHaveProperty('allocation');
        expect(airdrop).toHaveProperty('eligibilityCriteria');
        expect(airdrop).toHaveProperty('claimDeadline');
        expect(airdrop).toHaveProperty('status');
      });

      it('should have valid eligibility criteria array', () => {
        const airdrop = mockAirdrop();
        expect(Array.isArray(airdrop.eligibilityCriteria)).toBe(true);
        expect(airdrop.eligibilityCriteria.length).toBeGreaterThan(0);
      });

      it('should have valid status', () => {
        const airdrop = mockAirdrop();
        expect(['pending', 'eligible', 'claimed', 'expired']).toContain(airdrop.status);
      });
    });
  });

  describe('Mock Response', () => {
    describe('mockAPIResponse', () => {
      it('should generate successful response', () => {
        const response = mockAPIResponse({ data: 'test' });
        expect(response.success).toBe(true);
        expect(response.data).toEqual({ data: 'test' });
        expect(response.error).toBeUndefined();
      });

      it('should generate error response', () => {
        const response = mockAPIResponse(undefined, false);
        expect(response.success).toBe(false);
        expect(response.data).toBeUndefined();
        expect(response.error).toBeDefined();
      });

      it('should have timestamp', () => {
        const response = mockAPIResponse({ data: 'test' });
        expect(response.timestamp).toBeDefined();
        expect(typeof response.timestamp).toBe('number');
      });
    });
  });

  describe('Array and Pagination', () => {
    describe('mockArray', () => {
      it('should generate array of specified size', () => {
        const result = mockArray((i) => i * 2, 5);
        expect(result.length).toBe(5);
        expect(result).toEqual([0, 2, 4, 6, 8]);
      });

      it('should pass index to generator', () => {
        const result = mockArray((i) => ({ index: i }), 3);
        expect(result).toEqual([
          { index: 0 },
          { index: 1 },
          { index: 2 },
        ]);
      });

      it('should use default count', () => {
        const result = mockArray(() => 'item');
        expect(result.length).toBe(10);
      });
    });

    describe('mockPaginatedResponse', () => {
      const items = Array.from({ length: 25 }, (_, i) => i);

      it('should paginate items correctly', () => {
        const response = mockPaginatedResponse(items, 1, 10);
        expect(response.items.length).toBe(10);
        expect(response.items[0]).toBe(0);
        expect(response.items[9]).toBe(9);
      });

      it('should calculate total correctly', () => {
        const response = mockPaginatedResponse(items, 1, 10);
        expect(response.total).toBe(25);
      });

      it('should set hasMore correctly for first page', () => {
        const response = mockPaginatedResponse(items, 1, 10);
        expect(response.hasMore).toBe(true);
      });

      it('should set hasMore correctly for last page', () => {
        const response = mockPaginatedResponse(items, 3, 10);
        expect(response.hasMore).toBe(false);
      });

      it('should handle incomplete last page', () => {
        const response = mockPaginatedResponse(items, 3, 10);
        expect(response.items.length).toBe(5);
      });
    });
  });

  describe('Utilities', () => {
    describe('wait', () => {
      it('should wait for specified time', async () => {
        const start = Date.now();
        await wait(100);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(90); // Allow 10ms tolerance
      });
    });

    describe('mockError', () => {
      it('should create error with message', () => {
        const error = mockError('Test error');
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error');
      });

      it('should create error with code', () => {
        const error = mockError('Test error', 'TEST_CODE');
        expect((error as any).code).toBe('TEST_CODE');
      });

      it('should use default values', () => {
        const error = mockError();
        expect(error.message).toBe('Test error');
        expect((error as any).code).toBe('TEST_ERROR');
      });
    });
  });
});

