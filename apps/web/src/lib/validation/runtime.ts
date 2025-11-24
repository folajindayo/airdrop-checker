/**
 * Runtime type checking utilities
 */

import { z, ZodSchema } from "zod";

export function createRuntimeValidator<T>(schema: ZodSchema<T>) {
  return {
    validate(data: unknown): data is T {
      return schema.safeParse(data).success;
    },
    
    assert(data: unknown, message?: string): asserts data is T {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new Error(message || "Runtime validation failed");
      }
    },
    
    parse(data: unknown): T {
      return schema.parse(data);
    },
    
    safeParse(data: unknown) {
      return schema.safeParse(data);
    },
  };
}

export function validateAtRuntime<T>(
  schema: ZodSchema<T>,
  data: unknown,
  errorMessage?: string
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(errorMessage || `Validation failed: ${errors}`);
  }
  
  return result.data;
}

export function isValidAtRuntime<T>(
  schema: ZodSchema<T>,
  data: unknown
): data is T {
  return schema.safeParse(data).success;
}

export function createTypeGuard<T>(
  schema: ZodSchema<T>
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    return schema.safeParse(value).success;
  };
}

export function createAssertion<T>(
  schema: ZodSchema<T>,
  message?: string
): (value: unknown) => asserts value is T {
  return (value: unknown): asserts value is T => {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(
        message || `Assertion failed: ${result.error.message}`
      );
    }
  };
}

export class RuntimeValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodIssue[]
  ) {
    super(message);
    this.name = "RuntimeValidationError";
  }
}

export function validateWithDetails<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new RuntimeValidationError(
      "Runtime validation failed",
      result.error.errors
    );
  }
  
  return result.data;
}

export function createSchemaValidator<T>(schema: ZodSchema<T>) {
  return {
    isValid: (data: unknown): data is T => {
      return schema.safeParse(data).success;
    },
    
    validateOrThrow: (data: unknown): T => {
      return validateAtRuntime(schema, data);
    },
    
    validateOrNull: (data: unknown): T | null => {
      const result = schema.safeParse(data);
      return result.success ? result.data : null;
    },
    
    validateOrDefault: (data: unknown, defaultValue: T): T => {
      const result = schema.safeParse(data);
      return result.success ? result.data : defaultValue;
    },
  };
}

