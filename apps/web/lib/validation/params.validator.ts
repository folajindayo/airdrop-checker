/**
 * Parameter validation helpers
 */

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export function validateRequired<T>(value: T | null | undefined): boolean {
  return value !== null && value !== undefined && value !== '';
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function validateEnum<T>(value: T, allowed: T[]): boolean {
  return allowed.includes(value);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string
  ) {
    super(`Validation error for ${field}: ${message}`);
  }
}

export function createValidator<T>(rules: Record<string, ValidationRule<any>>) {
  return (data: T): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    Object.entries(rules).forEach(([field, rule]) => {
      const value = (data as any)[field];
      if (!rule.validate(value)) {
        errors[field] = rule.message;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
}

