/**
 * Select/Dropdown Component System
 * 
 * Provides accessible select components with support for:
 * - Single and multi-select
 * - Search/filtering
 * - Custom rendering
 * - Keyboard navigation
 * - Loading and disabled states
 * - Validation errors
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  loading?: boolean;
  clearable?: boolean;
  maxHeight?: string;
  className?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
  renderValue?: (value: string | string[]) => React.ReactNode;
  noOptionsMessage?: string;
  loadingMessage?: string;
  id?: string;
}

/**
 * Select Component
 * 
 * A fully accessible dropdown select component with support for
 * single/multi-select, search, keyboard navigation, and custom rendering.
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  error,
  label,
  required = false,
  multiple = false,
  searchable = false,
  loading = false,
  clearable = false,
  maxHeight = '300px',
  className,
  renderOption,
  renderValue,
  noOptionsMessage = 'No options available',
  loadingMessage = 'Loading...',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected option(s)
  const selectedOptions = options.filter((opt) =>
    multiple
      ? Array.isArray(value) && value.includes(opt.value)
      : opt.value === value
  );

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter((v) => v !== option.value)
        : [...currentValues, option.value];
      onChange?.(newValues);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(true);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;

      case ' ':
        if (!searchable && !isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
    }
  };

  const getDisplayValue = () => {
    if (renderValue && value) {
      return renderValue(value);
    }

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        return options.find((opt) => opt.value === value[0])?.label || placeholder;
      }
      return `${value.length} selected`;
    }

    return selectedOptions[0]?.label || placeholder;
  };

  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Select Trigger */}
        <button
          id={selectId}
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
    className={cn(
            'flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            disabled || loading
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800'
              : 'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700'
          )}
        >
          <span className={cn('flex-1 truncate', !value && 'text-gray-500')}>
            {loading ? loadingMessage : getDisplayValue()}
          </span>

          <div className="ml-2 flex items-center gap-2">
            {clearable && value && !disabled && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear selection"
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

            <svg
    className={cn(
                'h-5 w-5 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && !loading && (
          <div
            role="listbox"
            aria-multiselectable={multiple}
    className={cn(
              'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'
            )}
            style={{ maxHeight }}
          >
            {/* Search Input */}
            {searchable && (
              <div className="border-b border-gray-200 p-2 dark:border-gray-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  {noOptionsMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : option.value === value;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      disabled={option.disabled}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                        isHighlighted && 'bg-gray-100 dark:bg-gray-700',
                        isSelected &&
                          'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100',
                        option.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      {/* Checkbox for multi-select */}
                      {multiple && (
                        <div
      className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border',
                            isSelected
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300 dark:border-gray-600'
                          )}
                        >
                          {isSelected && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      )}

                      {/* Option Content */}
                      {renderOption ? (
                        renderOption(option)
                      ) : (
                        <div className="flex flex-1 items-center gap-3">
                          {option.icon && <span>{option.icon}</span>}
                          <div className="flex-1">
                            <div>{option.label}</div>
                            {option.description && (
                              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Checkmark for single-select */}
                      {!multiple && isSelected && (
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Native Select Component
 * 
 * A lightweight native HTML select for simple use cases.
 */
export interface NativeSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
}

export const NativeSelect: React.FC<NativeSelectProps> = ({
  options,
  onChange,
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const selectId = id || `native-select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <select
        id={selectId}
        onChange={(e) => onChange?.(e.target.value)}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-700',
          props.disabled && 'cursor-not-allowed bg-gray-100 dark:bg-gray-800'
        )}
        {...props}
      >
        {props.placeholder && (
          <option value="" disabled>
            {props.placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Helper Text */}
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
