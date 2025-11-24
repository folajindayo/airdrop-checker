/**
 * @fileoverview Schema validation utilities
 * 
 * Comprehensive schema validation using Zod with custom validators
 */

import { z } from 'zod';

/**
 * Validation result
 */
export interface ValidationResult<T> {
  /** Is valid */
  valid: boolean;
  /** Validated data (if valid) */
  data?: T;
  /** Validation errors */
  errors?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Field path */
  path: string;
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
}

/**
 * Custom error formatter
 */
function formatZodError(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Validate data against schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return {
      valid: true,
      data: validData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: formatZodError(error),
      };
    }
    throw error;
  }
}

/**
 * Validate data asynchronously
 */
export async function validateAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const validData = await schema.parseAsync(data);
    return {
      valid: true,
      data: validData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: formatZodError(error),
      };
    }
    throw error;
  }
}

/**
 * Safe parse (doesn't throw)
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      valid: true,
      data: result.data,
    };
  }

  return {
    valid: false,
    errors: formatZodError(result.error),
  };
}

/**
 * Custom Ethereum address validator
 */
export const ethereumAddress = z.string().refine(
  (value) => /^0x[a-fA-F0-9]{40}$/.test(value),
  { message: 'Invalid Ethereum address' }
);

/**
 * Custom ENS name validator
 */
export const ensName = z.string().refine(
  (value) => /^[a-z0-9-]+\.eth$/.test(value),
  { message: 'Invalid ENS name' }
);

/**
 * Custom URL validator
 */
export const httpUrl = z.string().url().refine(
  (value) => value.startsWith('http://') || value.startsWith('https://'),
  { message: 'URL must start with http:// or https://' }
);

/**
 * Custom email validator (stricter than default)
 */
export const strictEmail = z.string().email().refine(
  (value) => {
    const parts = value.split('@');
    return parts.length === 2 && parts[1].includes('.');
  },
  { message: 'Invalid email format' }
);

/**
 * Custom phone number validator (international format)
 */
export const phoneNumber = z.string().refine(
  (value) => /^\+?[1-9]\d{1,14}$/.test(value),
  { message: 'Invalid phone number format' }
);

/**
 * Custom password validator
 */
export const strongPassword = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (value) => /[a-z]/.test(value),
    { message: 'Password must contain at least one lowercase letter' }
  )
  .refine(
    (value) => /[A-Z]/.test(value),
    { message: 'Password must contain at least one uppercase letter' }
  )
  .refine(
    (value) => /[0-9]/.test(value),
    { message: 'Password must contain at least one number' }
  )
  .refine(
    (value) => /[^a-zA-Z0-9]/.test(value),
    { message: 'Password must contain at least one special character' }
  );

/**
 * Custom hex color validator
 */
export const hexColor = z.string().refine(
  (value) => /^#[0-9A-Fa-f]{6}$/.test(value),
  { message: 'Invalid hex color format' }
);

/**
 * Custom JSON validator
 */
export const jsonString = z.string().refine(
  (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid JSON string' }
);

/**
 * Custom date range validator
 */
export function dateRange(minDate?: Date, maxDate?: Date) {
  let schema = z.date();

  if (minDate) {
    schema = schema.min(minDate, `Date must be after ${minDate.toISOString()}`);
  }

  if (maxDate) {
    schema = schema.max(maxDate, `Date must be before ${maxDate.toISOString()}`);
  }

  return schema;
}

/**
 * Custom number range validator
 */
export function numberRange(min?: number, max?: number, integer = false) {
  let schema = integer ? z.number().int() : z.number();

  if (min !== undefined) {
    schema = schema.min(min, `Number must be at least ${min}`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `Number must be at most ${max}`);
  }

  return schema;
}

/**
 * Custom array length validator
 */
export function arrayLength<T>(
  schema: z.ZodSchema<T>,
  min?: number,
  max?: number
) {
  let arraySchema = z.array(schema);

  if (min !== undefined) {
    arraySchema = arraySchema.min(min, `Array must have at least ${min} items`);
  }

  if (max !== undefined) {
    arraySchema = arraySchema.max(max, `Array must have at most ${max} items`);
  }

  return arraySchema;
}

/**
 * Common schemas
 */
export const schemas = {
  // User schemas
  user: z.object({
    id: z.string().uuid(),
    email: strictEmail,
    username: z.string().min(3).max(20),
    password: strongPassword,
    createdAt: z.date(),
    updatedAt: z.date(),
  }),

  // Wallet schemas
  wallet: z.object({
    address: ethereumAddress,
    ensName: ensName.optional(),
    balance: z.string(),
    chainId: z.number().positive(),
  }),

  // Transaction schemas
  transaction: z.object({
    hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    from: ethereumAddress,
    to: ethereumAddress,
    value: z.string(),
    gasPrice: z.string().optional(),
    gasLimit: z.string().optional(),
    nonce: z.number().nonnegative(),
    timestamp: z.number().positive(),
  }),

  // Airdrop schemas
  airdrop: z.object({
    projectName: z.string().min(1).max(100),
    tokenSymbol: z.string().min(1).max(10),
    allocation: z.number().positive(),
    eligibilityCriteria: z.array(z.string()),
    claimDeadline: z.date(),
  }),

  // API request schemas
  apiRequest: z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    url: httpUrl,
    headers: z.record(z.string()).optional(),
    body: z.unknown().optional(),
    timeout: z.number().positive().optional(),
  }),

  // Pagination schemas
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive().max(100),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

/**
 * Schema builder
 */
export class SchemaBuilder<T> {
  private schema: z.ZodSchema<T>;

  constructor(schema: z.ZodSchema<T>) {
    this.schema = schema;
  }

  /**
   * Make field optional
   */
  optional(): SchemaBuilder<T | undefined> {
    return new SchemaBuilder(this.schema.optional());
  }

  /**
   * Make field nullable
   */
  nullable(): SchemaBuilder<T | null> {
    return new SchemaBuilder(this.schema.nullable());
  }

  /**
   * Set default value
   */
  default(value: T): SchemaBuilder<T> {
    return new SchemaBuilder(this.schema.default(value));
  }

  /**
   * Add custom validation
   */
  refine(
    check: (value: T) => boolean,
    message: string
  ): SchemaBuilder<T> {
    return new SchemaBuilder(this.schema.refine(check, { message }));
  }

  /**
   * Transform value
   */
  transform<U>(fn: (value: T) => U): SchemaBuilder<U> {
    return new SchemaBuilder(this.schema.transform(fn));
  }

  /**
   * Get final schema
   */
  build(): z.ZodSchema<T> {
    return this.schema;
  }

  /**
   * Validate data
   */
  validate(data: unknown): ValidationResult<T> {
    return validate(this.schema, data);
  }
}

/**
 * Create schema builder
 */
export function createSchema<T>(schema: z.ZodSchema<T>): SchemaBuilder<T> {
  return new SchemaBuilder(schema);
}

/**
 * Example usage:
 * 
 * // Simple validation
 * const result = validate(schemas.user, userData);
 * if (result.valid) {
 *   console.log('Valid user:', result.data);
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 * 
 * // Custom schema
 * const customSchema = z.object({
 *   address: ethereumAddress,
 *   amount: numberRange(0, 1000000),
 *   tags: arrayLength(z.string(), 1, 10),
 * });
 * 
 * // Schema builder
 * const schema = createSchema(z.string())
 *   .refine((s) => s.length > 5, 'Must be longer than 5')
 *   .transform((s) => s.toUpperCase())
 *   .build();
 */

