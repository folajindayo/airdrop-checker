import { ValidationError } from '../_errors';

/**
 * Validation schemas and utilities
 */

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

export type ValidationSchema = Record<string, ValidationRule>;

/**
 * Validate data against schema
 */
export function validate(data: any, schema: ValidationSchema): void {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip further validation if not required and value is empty
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type check
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors[field] = `${field} must be of type ${rules.type}`;
        continue;
      }
    }

    // Min/Max for numbers and strings
    if (rules.min !== undefined) {
      if (typeof value === 'number' && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
      } else if (typeof value === 'string' && value.length < rules.min) {
        errors[field] = `${field} must be at least ${rules.min} characters`;
      }
    }

    if (rules.max !== undefined) {
      if (typeof value === 'number' && value > rules.max) {
        errors[field] = `${field} must be at most ${rules.max}`;
      } else if (typeof value === 'string' && value.length > rules.max) {
        errors[field] = `${field} must be at most ${rules.max} characters`;
      }
    }

    // Pattern matching
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        errors[field] = `${field} format is invalid`;
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value);
      if (result !== true) {
        errors[field] = typeof result === 'string' ? result : `${field} is invalid`;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Common validation patterns
 */
export const patterns = {
  ethereumAddress: /^0x[a-fA-F0-9]{40}$/,
  transactionHash: /^0x[a-fA-F0-9]{64}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  hexColor: /^#[0-9a-fA-F]{6}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
};

/**
 * Common validators
 */
export const validators = {
  isEthereumAddress: (value: string): boolean => patterns.ethereumAddress.test(value),
  isTransactionHash: (value: string): boolean => patterns.transactionHash.test(value),
  isEmail: (value: string): boolean => patterns.email.test(value),
  isUrl: (value: string): boolean => patterns.url.test(value),
  isPositiveNumber: (value: number): boolean => typeof value === 'number' && value > 0,
  isNonNegativeNumber: (value: number): boolean => typeof value === 'number' && value >= 0,
  isInteger: (value: number): boolean => Number.isInteger(value),
  isInRange: (value: number, min: number, max: number): boolean =>
    typeof value === 'number' && value >= min && value <= max,
};

/**
 * Sanitization utilities
 */
export const sanitize = {
  string: (value: any): string => String(value).trim(),
  number: (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  },
  boolean: (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  },
  array: (value: any): any[] => (Array.isArray(value) ? value : []),
  ethereumAddress: (value: string): string => value.toLowerCase().trim(),
};

