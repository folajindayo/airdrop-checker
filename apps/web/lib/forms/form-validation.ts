/**
 * @fileoverview Form validation utilities
 * 
 * Provides comprehensive form validation utilities with support for
 * custom validators, async validation, and field dependencies
 */

import { z, ZodSchema } from 'zod';

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  type: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  values?: Record<string, unknown>;
}

/**
 * Field validator function
 */
export type FieldValidator<T = unknown> = (
  value: T,
  formValues: Record<string, unknown>
) => string | null | Promise<string | null>;

/**
 * Field validation rule
 */
export interface ValidationRule<T = unknown> {
  validator: FieldValidator<T>;
  message?: string;
}

/**
 * Form validator configuration
 */
export interface FormValidatorConfig {
  fields: Record<string, ValidationRule[]>;
  schema?: ZodSchema;
}

/**
 * Form validator class
 */
export class FormValidator {
  private config: FormValidatorConfig;
  private errors: Map<string, string[]> = new Map();

  constructor(config: FormValidatorConfig) {
    this.config = config;
  }

  /**
   * Validate entire form
   */
  async validate(
    formValues: Record<string, unknown>
  ): Promise<ValidationResult> {
    this.errors.clear();

    // Validate with Zod schema if provided
    if (this.config.schema) {
      try {
        const validatedData = this.config.schema.parse(formValues);
        return {
          isValid: true,
          errors: [],
          values: validatedData,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: ValidationError[] = error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            type: err.code,
          }));

          return {
            isValid: false,
            errors,
          };
        }
      }
    }

    // Validate with custom rules
    const validationPromises = Object.entries(this.config.fields).map(
      async ([field, rules]) => {
        const value = formValues[field];
        const fieldErrors: string[] = [];

        for (const rule of rules) {
          const error = await rule.validator(value, formValues);
          if (error) {
            fieldErrors.push(error);
          }
        }

        if (fieldErrors.length > 0) {
          this.errors.set(field, fieldErrors);
        }
      }
    );

    await Promise.all(validationPromises);

    const errors: ValidationError[] = [];
    this.errors.forEach((messages, field) => {
      messages.forEach((message) => {
        errors.push({
          field,
          message,
          type: 'custom',
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      values: errors.length === 0 ? formValues : undefined,
    };
  }

  /**
   * Validate single field
   */
  async validateField(
    field: string,
    value: unknown,
    formValues: Record<string, unknown>
  ): Promise<string[]> {
    const rules = this.config.fields[field] || [];
    const errors: string[] = [];

    for (const rule of rules) {
      const error = await rule.validator(value, formValues);
      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      this.errors.set(field, errors);
    } else {
      this.errors.delete(field);
    }

    return errors;
  }

  /**
   * Get errors for field
   */
  getFieldErrors(field: string): string[] {
    return this.errors.get(field) || [];
  }

  /**
   * Clear errors
   */
  clearErrors(field?: string): void {
    if (field) {
      this.errors.delete(field);
    } else {
      this.errors.clear();
    }
  }

  /**
   * Check if field has errors
   */
  hasErrors(field?: string): boolean {
    if (field) {
      return this.errors.has(field);
    }
    return this.errors.size > 0;
  }
}

/**
 * Common validators
 */
export const Validators = {
  /**
   * Required field
   */
  required: (message = 'This field is required'): ValidationRule => ({
    validator: (value) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return null;
    },
    message,
  }),

  /**
   * Minimum length
   */
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validator: (value) => {
      if (typeof value !== 'string') return null;
      if (value.length < min) {
        return message || `Minimum length is ${min} characters`;
      }
      return null;
    },
    message,
  }),

  /**
   * Maximum length
   */
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validator: (value) => {
      if (typeof value !== 'string') return null;
      if (value.length > max) {
        return message || `Maximum length is ${max} characters`;
      }
      return null;
    },
    message,
  }),

  /**
   * Email validation
   */
  email: (message = 'Invalid email address'): ValidationRule<string> => ({
    validator: (value) => {
      if (typeof value !== 'string') return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return message;
      }
      return null;
    },
    message,
  }),

  /**
   * URL validation
   */
  url: (message = 'Invalid URL'): ValidationRule<string> => ({
    validator: (value) => {
      if (typeof value !== 'string') return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    },
    message,
  }),

  /**
   * Pattern matching
   */
  pattern: (
    regex: RegExp,
    message = 'Invalid format'
  ): ValidationRule<string> => ({
    validator: (value) => {
      if (typeof value !== 'string') return null;
      if (!regex.test(value)) {
        return message;
      }
      return null;
    },
    message,
  }),

  /**
   * Minimum value
   */
  min: (min: number, message?: string): ValidationRule<number> => ({
    validator: (value) => {
      if (typeof value !== 'number') return null;
      if (value < min) {
        return message || `Minimum value is ${min}`;
      }
      return null;
    },
    message,
  }),

  /**
   * Maximum value
   */
  max: (max: number, message?: string): ValidationRule<number> => ({
    validator: (value) => {
      if (typeof value !== 'number') return null;
      if (value > max) {
        return message || `Maximum value is ${max}`;
      }
      return null;
    },
    message,
  }),

  /**
   * Must match another field
   */
  matches: (
    otherField: string,
    message?: string
  ): ValidationRule => ({
    validator: (value, formValues) => {
      if (value !== formValues[otherField]) {
        return message || `Must match ${otherField}`;
      }
      return null;
    },
    message,
  }),

  /**
   * Custom validator
   */
  custom: <T = unknown>(
    validator: FieldValidator<T>,
    message?: string
  ): ValidationRule<T> => ({
    validator,
    message,
  }),

  /**
   * Async validator (e.g., for API checks)
   */
  async: <T = unknown>(
    validator: (value: T) => Promise<string | null>,
    message?: string
  ): ValidationRule<T> => ({
    validator: async (value) => {
      const result = await validator(value);
      return result;
    },
    message,
  }),

  /**
   * One of the values
   */
  oneOf: <T = unknown>(
    allowedValues: T[],
    message?: string
  ): ValidationRule<T> => ({
    validator: (value) => {
      if (!allowedValues.includes(value as T)) {
        return message || `Must be one of: ${allowedValues.join(', ')}`;
      }
      return null;
    },
    message,
  }),

  /**
   * Not one of the values
   */
  notOneOf: <T = unknown>(
    disallowedValues: T[],
    message?: string
  ): ValidationRule<T> => ({
    validator: (value) => {
      if (disallowedValues.includes(value as T)) {
        return message || `Cannot be one of: ${disallowedValues.join(', ')}`;
      }
      return null;
    },
    message,
  }),

  /**
   * Integer check
   */
  integer: (message = 'Must be an integer'): ValidationRule<number> => ({
    validator: (value) => {
      if (typeof value !== 'number') return null;
      if (!Number.isInteger(value)) {
        return message;
      }
      return null;
    },
    message,
  }),

  /**
   * Positive number
   */
  positive: (message = 'Must be positive'): ValidationRule<number> => ({
    validator: (value) => {
      if (typeof value !== 'number') return null;
      if (value <= 0) {
        return message;
      }
      return null;
    },
    message,
  }),

  /**
   * Phone number
   */
  phone: (message = 'Invalid phone number'): ValidationRule<string> => ({
    validator: (value) => {
      if (typeof value !== 'string') return null;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(value.replace(/[\s-()]/g, ''))) {
        return message;
      }
      return null;
    },
    message,
  }),

  /**
   * Credit card
   */
  creditCard: (message = 'Invalid credit card number'): ValidationRule<string> => ({
    validator: (value) => {
      if (typeof value !== 'string') return null;
      const cardNumber = value.replace(/\s/g, '');
      
      // Luhn algorithm
      let sum = 0;
      let isEven = false;
      
      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      if (sum % 10 !== 0) {
        return message;
      }
      
      return null;
    },
    message,
  }),
};

/**
 * Create form validator
 */
export function createFormValidator(
  config: FormValidatorConfig
): FormValidator {
  return new FormValidator(config);
}

/**
 * Validate with Zod schema
 */
export function validateWithSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult {
  try {
    const validatedData = schema.parse(data);
    return {
      isValid: true,
      errors: [],
      values: validatedData as Record<string, unknown>,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        type: err.code,
      }));

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: false,
      errors: [
        {
          field: 'unknown',
          message: 'Validation failed',
          type: 'unknown',
        },
      ],
    };
  }
}

