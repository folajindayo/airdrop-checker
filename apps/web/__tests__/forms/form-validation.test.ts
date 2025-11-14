/**
 * @fileoverview Tests for form validation utilities
 */

import {
  FormValidator,
  createFormValidator,
  validateWithSchema,
  Validators,
} from '@/lib/forms/form-validation';
import { z } from 'zod';

describe('Form Validation', () => {
  describe('FormValidator', () => {
    it('should validate form with rules', async () => {
      const validator = createFormValidator({
        fields: {
          email: [Validators.required(), Validators.email()],
          password: [Validators.required(), Validators.minLength(8)],
        },
      });

      const result = await validator.validate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect validation errors', async () => {
      const validator = createFormValidator({
        fields: {
          email: [Validators.required(), Validators.email()],
          password: [Validators.required()],
        },
      });

      const result = await validator.validate({
        email: 'invalid',
        password: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate single field', async () => {
      const validator = createFormValidator({
        fields: {
          email: [Validators.email()],
        },
      });

      const errors = await validator.validateField('email', 'invalid', {});

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('email');
    });

    it('should get field errors', async () => {
      const validator = createFormValidator({
        fields: {
          email: [Validators.required()],
        },
      });

      await validator.validate({ email: '' });

      expect(validator.getFieldErrors('email')).toHaveLength(1);
    });

    it('should clear errors', async () => {
      const validator = createFormValidator({
        fields: {
          email: [Validators.required()],
        },
      });

      await validator.validate({ email: '' });
      validator.clearErrors('email');

      expect(validator.getFieldErrors('email')).toHaveLength(0);
    });

    it('should check if has errors', async () => {
      const validator = createFormValidator({
        fields: {
          email: [Validators.required()],
        },
      });

      await validator.validate({ email: '' });

      expect(validator.hasErrors()).toBe(true);
      expect(validator.hasErrors('email')).toBe(true);
    });
  });

  describe('Validators.required', () => {
    it('should validate required field', async () => {
      const rule = Validators.required();
      expect(await rule.validator('value', {})).toBeNull();
      expect(await rule.validator('', {})).toBeTruthy();
      expect(await rule.validator(null, {})).toBeTruthy();
      expect(await rule.validator(undefined, {})).toBeTruthy();
    });

    it('should use custom message', async () => {
      const rule = Validators.required('Custom message');
      const error = await rule.validator('', {});
      expect(error).toBe('Custom message');
    });
  });

  describe('Validators.minLength', () => {
    it('should validate minimum length', async () => {
      const rule = Validators.minLength(5);
      expect(await rule.validator('hello', {})).toBeNull();
      expect(await rule.validator('hi', {})).toBeTruthy();
    });

    it('should handle non-strings', async () => {
      const rule = Validators.minLength(5);
      expect(await rule.validator(123, {})).toBeNull();
    });
  });

  describe('Validators.maxLength', () => {
    it('should validate maximum length', async () => {
      const rule = Validators.maxLength(5);
      expect(await rule.validator('hello', {})).toBeNull();
      expect(await rule.validator('hello world', {})).toBeTruthy();
    });
  });

  describe('Validators.email', () => {
    it('should validate email format', async () => {
      const rule = Validators.email();
      expect(await rule.validator('test@example.com', {})).toBeNull();
      expect(await rule.validator('invalid', {})).toBeTruthy();
      expect(await rule.validator('test@', {})).toBeTruthy();
      expect(await rule.validator('@example.com', {})).toBeTruthy();
    });
  });

  describe('Validators.url', () => {
    it('should validate URL format', async () => {
      const rule = Validators.url();
      expect(await rule.validator('https://example.com', {})).toBeNull();
      expect(await rule.validator('http://test.co', {})).toBeNull();
      expect(await rule.validator('invalid', {})).toBeTruthy();
      expect(await rule.validator('example.com', {})).toBeTruthy();
    });
  });

  describe('Validators.pattern', () => {
    it('should validate pattern', async () => {
      const rule = Validators.pattern(/^\d{3}-\d{3}$/, 'Invalid format');
      expect(await rule.validator('123-456', {})).toBeNull();
      expect(await rule.validator('123456', {})).toBeTruthy();
    });
  });

  describe('Validators.min', () => {
    it('should validate minimum value', async () => {
      const rule = Validators.min(10);
      expect(await rule.validator(15, {})).toBeNull();
      expect(await rule.validator(10, {})).toBeNull();
      expect(await rule.validator(5, {})).toBeTruthy();
    });
  });

  describe('Validators.max', () => {
    it('should validate maximum value', async () => {
      const rule = Validators.max(100);
      expect(await rule.validator(50, {})).toBeNull();
      expect(await rule.validator(100, {})).toBeNull();
      expect(await rule.validator(150, {})).toBeTruthy();
    });
  });

  describe('Validators.matches', () => {
    it('should validate field matching', async () => {
      const rule = Validators.matches('password');
      const formValues = { password: 'secret123' };

      expect(await rule.validator('secret123', formValues)).toBeNull();
      expect(await rule.validator('different', formValues)).toBeTruthy();
    });
  });

  describe('Validators.custom', () => {
    it('should use custom validator', async () => {
      const rule = Validators.custom((value) => {
        return value === 'valid' ? null : 'Invalid value';
      });

      expect(await rule.validator('valid', {})).toBeNull();
      expect(await rule.validator('invalid', {})).toBe('Invalid value');
    });
  });

  describe('Validators.async', () => {
    it('should handle async validation', async () => {
      const rule = Validators.async(async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return value === 'valid' ? null : 'Invalid';
      });

      expect(await rule.validator('valid', {})).toBeNull();
      expect(await rule.validator('invalid', {})).toBe('Invalid');
    });
  });

  describe('Validators.oneOf', () => {
    it('should validate allowed values', async () => {
      const rule = Validators.oneOf(['red', 'green', 'blue']);
      expect(await rule.validator('red', {})).toBeNull();
      expect(await rule.validator('yellow', {})).toBeTruthy();
    });
  });

  describe('Validators.notOneOf', () => {
    it('should validate disallowed values', async () => {
      const rule = Validators.notOneOf(['admin', 'root']);
      expect(await rule.validator('user', {})).toBeNull();
      expect(await rule.validator('admin', {})).toBeTruthy();
    });
  });

  describe('Validators.integer', () => {
    it('should validate integers', async () => {
      const rule = Validators.integer();
      expect(await rule.validator(42, {})).toBeNull();
      expect(await rule.validator(3.14, {})).toBeTruthy();
    });
  });

  describe('Validators.positive', () => {
    it('should validate positive numbers', async () => {
      const rule = Validators.positive();
      expect(await rule.validator(10, {})).toBeNull();
      expect(await rule.validator(0, {})).toBeTruthy();
      expect(await rule.validator(-5, {})).toBeTruthy();
    });
  });

  describe('Validators.phone', () => {
    it('should validate phone numbers', async () => {
      const rule = Validators.phone();
      expect(await rule.validator('+1234567890', {})).toBeNull();
      expect(await rule.validator('+44 20 1234 5678', {})).toBeNull();
      expect(await rule.validator('123', {})).toBeTruthy();
      expect(await rule.validator('invalid', {})).toBeTruthy();
    });
  });

  describe('Validators.creditCard', () => {
    it('should validate credit card with Luhn algorithm', async () => {
      const rule = Validators.creditCard();
      
      // Valid test card number (Visa)
      expect(await rule.validator('4532015112830366', {})).toBeNull();
      
      // Invalid card number
      expect(await rule.validator('1234567890123456', {})).toBeTruthy();
    });

    it('should handle card with spaces', async () => {
      const rule = Validators.creditCard();
      expect(await rule.validator('4532 0151 1283 0366', {})).toBeNull();
    });
  });

  describe('validateWithSchema', () => {
    it('should validate with Zod schema', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      const result = validateWithSchema(schema, {
        email: 'test@example.com',
        age: 25,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect Zod errors', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      const result = validateWithSchema(schema, {
        email: 'invalid',
        age: 15,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle nested schemas', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });

      const result = validateWithSchema(schema, {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('FormValidator with schema', () => {
    it('should validate with Zod schema', async () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      const validator = createFormValidator({
        fields: {},
        schema,
      });

      const result = await validator.validate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isValid).toBe(true);
    });

    it('should collect schema errors', async () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const validator = createFormValidator({
        fields: {},
        schema,
      });

      const result = await validator.validate({
        email: 'invalid',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Complex validation scenarios', () => {
    it('should validate dependent fields', async () => {
      const validator = createFormValidator({
        fields: {
          password: [Validators.required(), Validators.minLength(8)],
          confirmPassword: [
            Validators.required(),
            Validators.matches('password', 'Passwords must match'),
          ],
        },
      });

      const result = await validator.validate({
        password: 'secret123',
        confirmPassword: 'secret123',
      });

      expect(result.isValid).toBe(true);
    });

    it('should validate multiple rules per field', async () => {
      const validator = createFormValidator({
        fields: {
          username: [
            Validators.required(),
            Validators.minLength(3),
            Validators.maxLength(20),
            Validators.pattern(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
          ],
        },
      });

      const result = await validator.validate({
        username: 'valid_user123',
      });

      expect(result.isValid).toBe(true);
    });

    it('should stop at first error per field', async () => {
      const validator = createFormValidator({
        fields: {
          email: [
            Validators.required('Email is required'),
            Validators.email('Invalid email'),
          ],
        },
      });

      const result = await validator.validate({
        email: '',
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Email is required');
    });
  });

  describe('Error handling', () => {
    it('should handle validator exceptions', async () => {
      const validator = createFormValidator({
        fields: {
          test: [
            Validators.custom(() => {
              throw new Error('Validator error');
            }),
          ],
        },
      });

      await expect(validator.validate({ test: 'value' })).rejects.toThrow();
    });
  });
});

