/**
 * Input Component System
 * 
 * Unified input components with comprehensive features:
 * - Text, email, password, number, tel, url, search types
 * - Icons and actions (prefix/suffix) using CVA
 * - Validation states
 * - Loading states
 * - Character count
 * - Clear button
 * - Password toggle
 * - Specialized variants (Search, Password, Number)
 */

'use client';

import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 placeholder:text-gray-400 dark:placeholder:text-gray-500',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:ring-blue-500 dark:border-gray-700',
        error: 'border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:ring-green-500',
      },
      inputSize: {
        sm: 'h-8 text-sm px-3',
        md: 'h-10 text-base px-4',
        lg: 'h-12 text-lg px-5',
      },
      state: {
        default: 'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100',
        disabled: 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<VariantProps<typeof inputVariants>, 'state'> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  onPrefixClick?: () => void;
  onSuffixClick?: () => void;
  clearable?: boolean;
  loading?: boolean;
  showPasswordToggle?: boolean;
  showCharacterCount?: boolean;
  fullWidth?: boolean;
}

/**
 * Input Component
 * 
 * A fully accessible input component with support for various types,
 * icons, validation states, and additional features.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      onPrefixClick,
      onSuffixClick,
      clearable = false,
      loading = false,
      showPasswordToggle = false,
      showCharacterCount = false,
      fullWidth = true,
      inputSize = 'md',
      className,
      type = 'text',
      disabled,
      value,
      maxLength,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');

    const inputType =
      type === 'password' && showPasswordToggle && showPassword ? 'text' : type;

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      setInternalValue('');
      onChange?.(event);
    };

    const currentValue = value !== undefined ? value : internalValue;
    const characterCount =
      typeof currentValue === 'string' ? currentValue.length : 0;

    const inputVariantValue = error ? 'error' : variant;
    const inputStateValue = disabled || loading ? 'disabled' : 'default';

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative flex items-center">
          {/* Prefix Icon */}
          {prefixIcon && (
            <button
              type="button"
              onClick={onPrefixClick}
              disabled={!onPrefixClick}
              className={cn(
                'absolute left-3 z-10 flex items-center justify-center',
                onPrefixClick
                  ? 'cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  : 'cursor-default text-gray-400'
              )}
              tabIndex={onPrefixClick ? 0 : -1}
            >
              {prefixIcon}
            </button>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            value={currentValue}
            onChange={handleChange}
            disabled={disabled || loading}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              inputVariants({ 
                variant: inputVariantValue, 
                inputSize, 
                state: inputStateValue 
              }),
              prefixIcon && 'pl-10',
              (suffixIcon ||
                clearable ||
                showPasswordToggle ||
                loading ||
                showCharacterCount) &&
                'pr-10'
            )}
            {...props}
          />

          {/* Suffix Icons */}
          <div className="absolute right-3 flex items-center gap-2">
            {/* Loading Spinner */}
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            )}

            {/* Clear Button */}
            {!loading && clearable && currentValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear input"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Password Toggle */}
            {!loading &&
              type === 'password' &&
              showPasswordToggle &&
              !disabled && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              )}

            {/* Suffix Icon */}
            {!loading && suffixIcon && (
              <button
                type="button"
                onClick={onSuffixClick}
                disabled={!onSuffixClick}
                className={cn(
                  'flex items-center justify-center',
                  onSuffixClick
                    ? 'cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    : 'cursor-default text-gray-400'
                )}
                tabIndex={onSuffixClick ? 0 : -1}
              >
                {suffixIcon}
              </button>
            )}
          </div>
        </div>

        {/* Helper Text / Error / Character Count */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </div>

          {showCharacterCount && maxLength && (
            <span
        className={cn(
                'text-xs',
                characterCount > maxLength
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 * 
 * A textarea component with similar features to Input.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharacterCount = false,
      fullWidth = true,
      resize = 'vertical',
      className,
      disabled,
      value,
      maxLength,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || '');

    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const currentValue = value !== undefined ? value : internalValue;
    const characterCount =
      typeof currentValue === 'string' ? currentValue.length : 0;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full rounded-lg border px-4 py-2.5 text-base transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            resizeClasses[resize],
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700',
            disabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800'
              : 'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100'
          )}
          {...props}
        />

        {/* Helper Text / Error / Character Count */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </div>

          {showCharacterCount && maxLength && (
            <span
              className={cn(
                'text-xs',
                characterCount > maxLength
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Search Input Component
 * 
 * A specialized input for search functionality.
 */
export interface SearchInputProps extends Omit<InputProps, 'type' | 'prefixIcon'> {
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(e.currentTarget.value);
      }
      onKeyDown?.(e);
    };

    return (
      <Input
        ref={ref}
        type="search"
        prefixIcon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        onKeyDown={handleKeyDown}
        clearable
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
