/**
 * Tests for params validator
 */

import {
  validateRequired,
  validateRange,
  validateEnum,
  validateEmail,
  validateUrl,
  createValidator,
  ValidationError,
} from '@/lib/validators/params.validator';

describe('Params Validator', () => {
  describe('validateRequired', () => {
    it('should validate required values', () => {
      expect(validateRequired('value')).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
    });

    it('should reject null, undefined, and empty string', () => {
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
      expect(validateRequired('')).toBe(false);
    });
  });

  describe('validateRange', () => {
    it('should validate numbers within range', () => {
      expect(validateRange(5, 0, 10)).toBe(true);
      expect(validateRange(0, 0, 10)).toBe(true);
      expect(validateRange(10, 0, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      expect(validateRange(-1, 0, 10)).toBe(false);
      expect(validateRange(11, 0, 10)).toBe(false);
    });
  });

  describe('validateEnum', () => {
    it('should validate enum values', () => {
      expect(validateEnum('confirmed', ['confirmed', 'rumored'])).toBe(true);
      expect(validateEnum('rumored', ['confirmed', 'rumored'])).toBe(true);
    });

    it('should reject values not in enum', () => {
      expect(validateEnum('invalid', ['confirmed', 'rumored'])).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should validate email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('createValidator', () => {
    it('should create validator function', () => {
      const validator = createValidator({
        name: {
          validate: validateRequired,
          message: 'Name is required',
        },
      });

      const result = validator({ name: 'Test' });
      expect(result.isValid).toBe(true);
    });

    it('should return errors for invalid data', () => {
      const validator = createValidator({
        name: {
          validate: validateRequired,
          message: 'Name is required',
        },
      });

      const result = validator({ name: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('name');
    });
  });
});

