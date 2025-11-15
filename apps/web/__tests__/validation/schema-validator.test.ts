/**
 * @fileoverview Tests for schema validator
 */

import { z } from 'zod';
import {
  validate,
  validateAsync,
  safeParse,
  ethereumAddress,
  ensName,
  httpUrl,
  strictEmail,
  phoneNumber,
  strongPassword,
  hexColor,
  jsonString,
  dateRange,
  numberRange,
  arrayLength,
  schemas,
  createSchema,
} from '@/lib/validation/schema-validator';

describe('Schema Validator', () => {
  describe('Basic Validation', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    it('should validate valid data', () => {
      const result = validate(schema, { name: 'John', age: 30 });
      
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
      expect(result.errors).toBeUndefined();
    });

    it('should reject invalid data', () => {
      const result = validate(schema, { name: 'John', age: 'invalid' });
      
      expect(result.valid).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should format error messages', () => {
      const result = validate(schema, { name: 123, age: 30 });
      
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toHaveProperty('path');
      expect(result.errors?.[0]).toHaveProperty('message');
    });
  });

  describe('Async Validation', () => {
    const schema = z.object({
      name: z.string(),
    });

    it('should validate asynchronously', async () => {
      const result = await validateAsync(schema, { name: 'John' });
      
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ name: 'John' });
    });

    it('should handle async validation errors', async () => {
      const result = await validateAsync(schema, { name: 123 });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Safe Parse', () => {
    const schema = z.string();

    it('should not throw on validation error', () => {
      expect(() => {
        safeParse(schema, 123);
      }).not.toThrow();
    });

    it('should return result with errors', () => {
      const result = safeParse(schema, 123);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Custom Validators', () => {
    describe('ethereumAddress', () => {
      it('should validate valid Ethereum address', () => {
        const result = validate(ethereumAddress, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
        expect(result.valid).toBe(false); // Missing one character
        
        const validResult = validate(ethereumAddress, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
        expect(validResult.valid).toBe(true);
      });

      it('should reject invalid Ethereum address', () => {
        const result = validate(ethereumAddress, 'invalid');
        expect(result.valid).toBe(false);
      });

      it('should reject address without 0x prefix', () => {
        const result = validate(ethereumAddress, '742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
        expect(result.valid).toBe(false);
      });
    });

    describe('ensName', () => {
      it('should validate valid ENS name', () => {
        const result = validate(ensName, 'vitalik.eth');
        expect(result.valid).toBe(true);
      });

      it('should reject ENS name without .eth', () => {
        const result = validate(ensName, 'vitalik');
        expect(result.valid).toBe(false);
      });

      it('should reject ENS name with uppercase', () => {
        const result = validate(ensName, 'Vitalik.eth');
        expect(result.valid).toBe(false);
      });
    });

    describe('httpUrl', () => {
      it('should validate valid HTTP URL', () => {
        const result = validate(httpUrl, 'https://example.com');
        expect(result.valid).toBe(true);
      });

      it('should validate valid HTTP (not HTTPS) URL', () => {
        const result = validate(httpUrl, 'http://example.com');
        expect(result.valid).toBe(true);
      });

      it('should reject URL without protocol', () => {
        const result = validate(httpUrl, 'example.com');
        expect(result.valid).toBe(false);
      });

      it('should reject invalid URL', () => {
        const result = validate(httpUrl, 'not a url');
        expect(result.valid).toBe(false);
      });
    });

    describe('strictEmail', () => {
      it('should validate valid email', () => {
        const result = validate(strictEmail, 'user@example.com');
        expect(result.valid).toBe(true);
      });

      it('should reject email without domain', () => {
        const result = validate(strictEmail, 'user@');
        expect(result.valid).toBe(false);
      });

      it('should reject email without TLD', () => {
        const result = validate(strictEmail, 'user@example');
        expect(result.valid).toBe(false);
      });
    });

    describe('phoneNumber', () => {
      it('should validate valid phone number', () => {
        const result = validate(phoneNumber, '+1234567890');
        expect(result.valid).toBe(true);
      });

      it('should validate phone number without plus', () => {
        const result = validate(phoneNumber, '1234567890');
        expect(result.valid).toBe(true);
      });

      it('should reject invalid phone number', () => {
        const result = validate(phoneNumber, 'invalid');
        expect(result.valid).toBe(false);
      });
    });

    describe('strongPassword', () => {
      it('should validate strong password', () => {
        const result = validate(strongPassword, 'MyP@ssw0rd123');
        expect(result.valid).toBe(true);
      });

      it('should reject password without lowercase', () => {
        const result = validate(strongPassword, 'MYP@SSW0RD123');
        expect(result.valid).toBe(false);
      });

      it('should reject password without uppercase', () => {
        const result = validate(strongPassword, 'myp@ssw0rd123');
        expect(result.valid).toBe(false);
      });

      it('should reject password without number', () => {
        const result = validate(strongPassword, 'MyP@ssword');
        expect(result.valid).toBe(false);
      });

      it('should reject password without special character', () => {
        const result = validate(strongPassword, 'MyPassw0rd123');
        expect(result.valid).toBe(false);
      });

      it('should reject short password', () => {
        const result = validate(strongPassword, 'MyP@s1');
        expect(result.valid).toBe(false);
      });
    });

    describe('hexColor', () => {
      it('should validate valid hex color', () => {
        const result = validate(hexColor, '#FF5733');
        expect(result.valid).toBe(true);
      });

      it('should reject hex color without hash', () => {
        const result = validate(hexColor, 'FF5733');
        expect(result.valid).toBe(false);
      });

      it('should reject short hex color', () => {
        const result = validate(hexColor, '#F57');
        expect(result.valid).toBe(false);
      });
    });

    describe('jsonString', () => {
      it('should validate valid JSON string', () => {
        const result = validate(jsonString, '{"name": "John"}');
        expect(result.valid).toBe(true);
      });

      it('should reject invalid JSON string', () => {
        const result = validate(jsonString, '{invalid json}');
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Range Validators', () => {
    describe('dateRange', () => {
      it('should validate date within range', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2025-12-31');
        const schema = dateRange(minDate, maxDate);
        
        const result = validate(schema, new Date('2023-06-15'));
        expect(result.valid).toBe(true);
      });

      it('should reject date before minimum', () => {
        const minDate = new Date('2020-01-01');
        const schema = dateRange(minDate);
        
        const result = validate(schema, new Date('2019-12-31'));
        expect(result.valid).toBe(false);
      });

      it('should reject date after maximum', () => {
        const maxDate = new Date('2025-12-31');
        const schema = dateRange(undefined, maxDate);
        
        const result = validate(schema, new Date('2026-01-01'));
        expect(result.valid).toBe(false);
      });
    });

    describe('numberRange', () => {
      it('should validate number within range', () => {
        const schema = numberRange(0, 100);
        
        const result = validate(schema, 50);
        expect(result.valid).toBe(true);
      });

      it('should reject number below minimum', () => {
        const schema = numberRange(0, 100);
        
        const result = validate(schema, -1);
        expect(result.valid).toBe(false);
      });

      it('should reject number above maximum', () => {
        const schema = numberRange(0, 100);
        
        const result = validate(schema, 101);
        expect(result.valid).toBe(false);
      });

      it('should validate integer when specified', () => {
        const schema = numberRange(0, 100, true);
        
        const result = validate(schema, 50.5);
        expect(result.valid).toBe(false);
      });
    });

    describe('arrayLength', () => {
      it('should validate array within length range', () => {
        const schema = arrayLength(z.string(), 1, 5);
        
        const result = validate(schema, ['a', 'b', 'c']);
        expect(result.valid).toBe(true);
      });

      it('should reject array with too few items', () => {
        const schema = arrayLength(z.string(), 2, 5);
        
        const result = validate(schema, ['a']);
        expect(result.valid).toBe(false);
      });

      it('should reject array with too many items', () => {
        const schema = arrayLength(z.string(), 1, 3);
        
        const result = validate(schema, ['a', 'b', 'c', 'd']);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Common Schemas', () => {
    describe('user schema', () => {
      it('should validate valid user', () => {
        const result = validate(schemas.user, {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          username: 'john_doe',
          password: 'MyP@ssw0rd123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        expect(result.valid).toBe(true);
      });

      it('should reject invalid user', () => {
        const result = validate(schemas.user, {
          id: 'invalid-uuid',
          email: 'invalid-email',
          username: 'ab',
          password: 'weak',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        expect(result.valid).toBe(false);
      });
    });

    describe('wallet schema', () => {
      it('should validate valid wallet', () => {
        const result = validate(schemas.wallet, {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          balance: '1.5',
          chainId: 1,
        });
        
        expect(result.valid).toBe(true);
      });
    });

    describe('transaction schema', () => {
      it('should validate valid transaction', () => {
        const result = validate(schemas.transaction, {
          hash: '0x' + 'a'.repeat(64),
          from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          value: '1.5',
          nonce: 0,
          timestamp: 1234567890,
        });
        
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Schema Builder', () => {
    it('should build schema with optional', () => {
      const schema = createSchema(z.string()).optional().build();
      
      const result = validate(schema, undefined);
      expect(result.valid).toBe(true);
    });

    it('should build schema with nullable', () => {
      const schema = createSchema(z.string()).nullable().build();
      
      const result = validate(schema, null);
      expect(result.valid).toBe(true);
    });

    it('should build schema with default', () => {
      const schema = createSchema(z.string()).default('default').build();
      
      const result = validate(schema, undefined);
      expect(result.valid).toBe(true);
      expect(result.data).toBe('default');
    });

    it('should build schema with custom validation', () => {
      const schema = createSchema(z.string())
        .refine((s) => s.length > 5, 'Must be longer than 5')
        .build();
      
      const result = validate(schema, 'short');
      expect(result.valid).toBe(false);
    });

    it('should build schema with transformation', () => {
      const schema = createSchema(z.string())
        .transform((s) => s.toUpperCase())
        .build();
      
      const result = validate(schema, 'hello');
      expect(result.valid).toBe(true);
      expect(result.data).toBe('HELLO');
    });

    it('should validate using builder', () => {
      const builder = createSchema(z.string());
      const result = builder.validate('test');
      
      expect(result.valid).toBe(true);
      expect(result.data).toBe('test');
    });
  });
});

