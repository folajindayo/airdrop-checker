/**
 * Form validation utilities
 */

import { ZodSchema, ZodError } from "zod";

export interface FieldError {
  message: string;
  type: string;
}

export interface FormErrors<T> {
  [K in keyof T]?: FieldError;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export function validateForm<T>(
  schema: ZodSchema<T>,
  values: unknown
): { isValid: boolean; errors: FormErrors<T> } {
  try {
    schema.parse(values);
    return {
      isValid: true,
      errors: {},
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: FormErrors<T> = {};
      
      error.errors.forEach((err) => {
        const path = err.path[0] as keyof T;
        if (path) {
          errors[path] = {
            message: err.message,
            type: err.code,
          };
        }
      });

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: false,
      errors: {},
    };
  }
}

export function validateField<T>(
  schema: ZodSchema<T>,
  fieldName: keyof T,
  value: unknown
): FieldError | null {
  try {
    const partialSchema = schema.partial();
    partialSchema.parse({ [fieldName]: value });
    return null;
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldError = error.errors.find((err) => err.path[0] === fieldName);
      if (fieldError) {
        return {
          message: fieldError.message,
          type: fieldError.code,
        };
      }
    }
    return null;
  }
}

export function getFieldError<T>(
  errors: FormErrors<T>,
  fieldName: keyof T
): string | undefined {
  return errors[fieldName]?.message;
}

export function hasFieldError<T>(
  errors: FormErrors<T>,
  fieldName: keyof T
): boolean {
  return Boolean(errors[fieldName]);
}

export function clearFieldError<T>(
  errors: FormErrors<T>,
  fieldName: keyof T
): FormErrors<T> {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
}

export function setFieldError<T>(
  errors: FormErrors<T>,
  fieldName: keyof T,
  error: FieldError
): FormErrors<T> {
  return {
    ...errors,
    [fieldName]: error,
  };
}

export function hasAnyErrors<T>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

export function getErrorMessages<T>(errors: FormErrors<T>): string[] {
  return Object.values(errors)
    .filter((error): error is FieldError => error !== undefined)
    .map((error) => error.message);
}

