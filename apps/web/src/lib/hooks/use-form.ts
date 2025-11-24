/**
 * useForm Hook
 * 
 * A comprehensive form management hook with validation, error handling,
 * and submission support.
 */

'use client';

import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { z, ZodSchema } from 'zod';

export interface UseFormOptions<T> {
  /**
   * Initial form values
   */
  initialValues: T;
  
  /**
   * Validation schema (Zod)
   */
  validationSchema?: ZodSchema<T>;
  
  /**
   * Custom validation function
   */
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  
  /**
   * Submit handler
   */
  onSubmit: (values: T) => void | Promise<void>;
  
  /**
   * Whether to validate on change
   */
  validateOnChange?: boolean;
  
  /**
   * Whether to validate on blur
   */
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  /**
   * Current form values
   */
  values: T;
  
  /**
   * Form errors
   */
  errors: Partial<Record<keyof T, string>>;
  
  /**
   * Touched fields
   */
  touched: Partial<Record<keyof T, boolean>>;
  
  /**
   * Whether form is submitting
   */
  isSubmitting: boolean;
  
  /**
   * Whether form is valid
   */
  isValid: boolean;
  
  /**
   * Whether form has been modified
   */
  isDirty: boolean;
  
  /**
   * Set field value
   */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  
  /**
   * Set field error
   */
  setFieldError: <K extends keyof T>(field: K, error: string) => void;
  
  /**
   * Set field touched
   */
  setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  
  /**
   * Handle change event
   */
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  /**
   * Handle blur event
   */
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  /**
   * Handle submit event
   */
  handleSubmit: (e: FormEvent) => void;
  
  /**
   * Reset form to initial values
   */
  resetForm: () => void;
  
  /**
   * Set multiple values
   */
  setValues: (values: Partial<T>) => void;
  
  /**
   * Set multiple errors
   */
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  
  /**
   * Validate entire form
   */
  validateForm: () => Promise<boolean>;
  
  /**
   * Validate single field
   */
  validateField: <K extends keyof T>(field: K) => Promise<boolean>;
}

/**
 * useForm Hook
 * 
 * Provides comprehensive form state management with validation.
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  validate,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is dirty
  const isDirty = Object.keys(values).some(
    (key) => values[key] !== initialValues[key]
  );

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Validate using Zod schema
  const validateWithSchema = useCallback(
    async (valuesToValidate: T): Promise<Partial<Record<keyof T, string>>> => {
      if (!validationSchema) return {};

      try {
        await validationSchema.parseAsync(valuesToValidate);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Partial<Record<keyof T, string>> = {};
          error.errors.forEach((err) => {
            if (err.path.length > 0) {
              const field = err.path[0] as keyof T;
              fieldErrors[field] = err.message;
            }
          });
          return fieldErrors;
        }
        return {};
      }
    },
    [validationSchema]
  );

  // Validate using custom function
  const validateWithFunction = useCallback(
    (valuesToValidate: T): Partial<Record<keyof T, string>> => {
      if (!validate) return {};
      return validate(valuesToValidate);
    },
    [validate]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    let newErrors: Partial<Record<keyof T, string>> = {};

    // Use schema validation if available
    if (validationSchema) {
      newErrors = await validateWithSchema(values);
    }
    // Otherwise use custom validation
    else if (validate) {
      newErrors = validateWithFunction(values);
    }

    setErrorsState(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema, validate, validateWithSchema, validateWithFunction]);

  // Validate single field
  const validateField = useCallback(
    async <K extends keyof T>(field: K): Promise<boolean> => {
      let fieldError: string | undefined;

      // Use schema validation if available
      if (validationSchema) {
        const allErrors = await validateWithSchema(values);
        fieldError = allErrors[field];
      }
      // Otherwise use custom validation
      else if (validate) {
        const allErrors = validateWithFunction(values);
        fieldError = allErrors[field];
      }

      setErrorsState((prev) => {
        const newErrors = { ...prev };
        if (fieldError) {
          newErrors[field] = fieldError;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      return !fieldError;
    },
    [values, validationSchema, validate, validateWithSchema, validateWithFunction]
  );

  // Set field value
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        // Delay validation slightly to avoid race conditions
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, validateField]
  );

  // Set field error
  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error: string) => {
      setErrorsState((prev) => ({ ...prev, [field]: error }));
    },
    []
  );

  // Set field touched
  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, isTouched = true) => {
      setTouchedState((prev) => ({ ...prev, [field]: isTouched }));
    },
    []
  );

  // Handle change event
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      let fieldValue: any = value;
      
      // Handle checkbox
      if (type === 'checkbox') {
        fieldValue = (e.target as HTMLInputElement).checked;
      }
      // Handle number
      else if (type === 'number') {
        fieldValue = value === '' ? '' : Number(value);
      }

      setFieldValue(name as keyof T, fieldValue);
    },
    [setFieldValue]
  );

  // Handle blur event
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setFieldTouched(name as keyof T, true);

      if (validateOnBlur) {
        validateField(name as keyof T);
      }
    },
    [validateOnBlur, setFieldTouched, validateField]
  );

  // Handle submit event
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouchedState(allTouched);

      // Validate form
      const isFormValid = await validateForm();

      if (!isFormValid) {
        return;
      }

      // Submit form
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState((prev) => ({ ...prev, ...newErrors }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
    validateForm,
    validateField,
  };
}

/**
 * Helper to get field props for form inputs
 */
export function getFieldProps<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  field: keyof T
) {
  return {
    name: field as string,
    value: form.values[field],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.touched[field] ? form.errors[field] : undefined,
  };
}

