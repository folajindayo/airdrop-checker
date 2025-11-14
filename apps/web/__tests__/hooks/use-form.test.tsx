/**
 * @fileoverview Comprehensive tests for useForm hook
 * Tests form state management, validation, submission, and error handling
 */

import { renderHook, act } from '@testing-library/react';
import { useForm } from '@/lib/hooks/use-form';

interface TestFormData {
  username: string;
  email: string;
  age: number;
  terms: boolean;
}

describe('useForm', () => {
  const initialValues: TestFormData = {
    username: '',
    email: '',
    age: 0,
    terms: false,
  };

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isDirty).toBe(false);
    });

    it('should initialize with custom values', () => {
      const customValues: TestFormData = {
        username: 'john',
        email: 'john@example.com',
        age: 25,
        terms: true,
      };

      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues: customValues })
      );

      expect(result.current.values).toEqual(customValues);
    });
  });

  describe('Field Changes', () => {
    it('should update field value', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.handleChange('username', 'john');
      });

      expect(result.current.values.username).toBe('john');
      expect(result.current.isDirty).toBe(true);
    });

    it('should mark field as touched on change', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.handleChange('email', 'test@example.com');
      });

      expect(result.current.touched.email).toBe(true);
    });

    it('should handle multiple field changes', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.handleChange('username', 'john');
        result.current.handleChange('email', 'john@example.com');
        result.current.handleChange('age', 25);
      });

      expect(result.current.values).toEqual({
        username: 'john',
        email: 'john@example.com',
        age: 25,
        terms: false,
      });
    });
  });

  describe('Blur Handling', () => {
    it('should mark field as touched on blur', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.handleBlur('username');
      });

      expect(result.current.touched.username).toBe(true);
    });

    it('should validate field on blur when validateOnBlur is true', () => {
      const validate = jest.fn(() => ({ username: 'Required' }));

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          validateOnBlur: true,
        })
      );

      act(() => {
        result.current.handleBlur('username');
      });

      expect(validate).toHaveBeenCalledWith(result.current.values);
      expect(result.current.errors.username).toBe('Required');
    });
  });

  describe('Validation', () => {
    it('should validate on change when validateOnChange is true', () => {
      const validate = jest.fn((values: TestFormData) => {
        const errors: Partial<Record<keyof TestFormData, string>> = {};
        if (!values.username) errors.username = 'Username is required';
        if (!values.email) errors.email = 'Email is required';
        return errors;
      });

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          validateOnChange: true,
        })
      );

      act(() => {
        result.current.handleChange('username', 'john');
      });

      expect(validate).toHaveBeenCalled();
      expect(result.current.errors.username).toBeUndefined();
      expect(result.current.errors.email).toBe('Email is required');
    });

    it('should not validate on change when validateOnChange is false', () => {
      const validate = jest.fn();

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          validateOnChange: false,
        })
      );

      act(() => {
        result.current.handleChange('username', 'john');
      });

      expect(validate).not.toHaveBeenCalled();
    });

    it('should validate before submit', async () => {
      const validate = jest.fn((values: TestFormData) => {
        if (!values.username) return { username: 'Username is required' };
        return {};
      });

      const onSubmit = jest.fn();

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(validate).toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.errors.username).toBe('Username is required');
    });

    it('should not submit if validation fails', async () => {
      const validate = jest.fn(() => ({ username: 'Invalid' }));
      const onSubmit = jest.fn();

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should submit when validation passes', async () => {
      const validate = jest.fn(() => ({}));
      const onSubmit = jest.fn();

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          onSubmit,
        })
      );

      act(() => {
        result.current.handleChange('username', 'john');
        result.current.handleChange('email', 'john@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith({
        username: 'john',
        email: 'john@example.com',
        age: 0,
        terms: false,
      });
    });

    it('should set isSubmitting during submission', async () => {
      const onSubmit = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          onSubmit,
        })
      );

      const submitPromise = act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.isSubmitting).toBe(true);

      await submitPromise;

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle submission errors', async () => {
      const error = new Error('Submission failed');
      const onSubmit = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.isSubmitting).toBe(false);
      // Error should be handled but not crash
    });

    it('should mark all fields as touched on submit', async () => {
      const validate = jest.fn(() => ({ username: 'Required' }));
      const onSubmit = jest.fn();

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.touched).toEqual({
        username: true,
        email: true,
        age: true,
        terms: true,
      });
    });
  });

  describe('Form Reset', () => {
    it('should reset form to initial values', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.handleChange('username', 'john');
        result.current.handleChange('email', 'john@example.com');
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isDirty).toBe(false);
    });

    it('should reset to new values if provided', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      const newValues: TestFormData = {
        username: 'jane',
        email: 'jane@example.com',
        age: 30,
        terms: true,
      };

      act(() => {
        result.current.resetForm(newValues);
      });

      expect(result.current.values).toEqual(newValues);
    });
  });

  describe('Field-Level Operations', () => {
    it('should set field value', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.setFieldValue('username', 'john');
      });

      expect(result.current.values.username).toBe('john');
    });

    it('should set field error', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.setFieldError('email', 'Invalid email format');
      });

      expect(result.current.errors.email).toBe('Invalid email format');
    });

    it('should set field touched', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.setFieldTouched('age', true);
      });

      expect(result.current.touched.age).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    it('should set multiple values at once', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.setValues({
          username: 'john',
          email: 'john@example.com',
          age: 25,
          terms: true,
        });
      });

      expect(result.current.values).toEqual({
        username: 'john',
        email: 'john@example.com',
        age: 25,
        terms: true,
      });
    });

    it('should set multiple errors at once', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.setErrors({
          username: 'Too short',
          email: 'Invalid format',
        });
      });

      expect(result.current.errors).toEqual({
        username: 'Too short',
        email: 'Invalid format',
      });
    });

    it('should set multiple touched fields at once', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      act(() => {
        result.current.setTouched({
          username: true,
          email: true,
        });
      });

      expect(result.current.touched).toEqual({
        username: true,
        email: true,
      });
    });
  });

  describe('Helper Utilities', () => {
    it('should provide getFieldProps helper', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      const fieldProps = result.current.getFieldProps('username');

      expect(fieldProps).toHaveProperty('name', 'username');
      expect(fieldProps).toHaveProperty('value', '');
      expect(fieldProps).toHaveProperty('onChange');
      expect(fieldProps).toHaveProperty('onBlur');
    });

    it('should update field value through getFieldProps', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      const fieldProps = result.current.getFieldProps('username');

      act(() => {
        fieldProps.onChange({ target: { value: 'john' } } as any);
      });

      expect(result.current.values.username).toBe('john');
    });

    it('should mark field as touched through getFieldProps', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      const fieldProps = result.current.getFieldProps('username');

      act(() => {
        fieldProps.onBlur();
      });

      expect(result.current.touched.username).toBe(true);
    });
  });

  describe('Form State Flags', () => {
    it('should track isDirty correctly', () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({ initialValues })
      );

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.handleChange('username', 'john');
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.isDirty).toBe(false);
    });

    it('should track isValid correctly', () => {
      const validate = jest.fn((values: TestFormData) => {
        if (!values.username) return { username: 'Required' };
        return {};
      });

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          validateOnChange: true,
        })
      );

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.handleChange('username', 'john');
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined validation function', async () => {
      const onSubmit = jest.fn();

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalled();
    });

    it('should handle empty error object from validation', async () => {
      const validate = jest.fn(() => ({}));
      const onSubmit = jest.fn();

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          validate,
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalled();
    });

    it('should prevent concurrent submissions', async () => {
      const onSubmit = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          initialValues,
          onSubmit,
        })
      );

      act(() => {
        result.current.handleSubmit();
        result.current.handleSubmit(); // Try to submit again
      });

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should only be called once
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});

