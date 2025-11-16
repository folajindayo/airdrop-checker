/**
 * useForm Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useForm } from '../../../src/hooks/forms';

describe('useForm', () => {
  const initialValues = { email: '', password: '' };
  
  it('should initialize with initial values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: jest.fn(),
      })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle field changes', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('should validate form on submit', async () => {
    const validate = jest.fn().mockReturnValue({ email: 'Required' });
    const onSubmit = jest.fn();
    
    const { result } = renderHook(() =>
      useForm({
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
  });

  it('should submit valid form', async () => {
    const onSubmit = jest.fn();
    
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '',
    });
  });
});

