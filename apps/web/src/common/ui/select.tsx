/**
 * Select Component
 * Accessible select dropdown component
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const selectVariants = cva(
  'w-full rounded-lg border bg-white px-4 py-2 text-gray-900 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Help text below select
   */
  helpText?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Select options
   */
  options: SelectOption[];
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Whether label is required indicator
   */
  required?: boolean;
}

/**
 * Select component with label and validation
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   options={[
 *     { label: 'USA', value: 'us' },
 *     { label: 'UK', value: 'uk' }
 *   ]}
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helpText,
      error,
      options,
      placeholder,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${React.useId()}`;
    const hasError = Boolean(error);
    const selectVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={selectVariants({
            variant: selectVariant,
            size,
            className,
          })}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
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
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helpText && (
          <p id={`${selectId}-help`} className="mt-2 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

/**
 * Multi Select Component
 */
export interface MultiSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  helpText?: string;
  error?: string;
  options: SelectOption[];
  required?: boolean;
  visibleOptions?: number;
}

export const MultiSelect = React.forwardRef<HTMLSelectElement, MultiSelectProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helpText,
      error,
      options,
      required,
      id,
      visibleOptions = 5,
      ...props
    },
    ref
  ) => {
    const selectId = id || `multiselect-${React.useId()}`;
    const hasError = Boolean(error);
    const selectVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          multiple
          size={visibleOptions}
          className={selectVariants({
            variant: selectVariant,
            size,
            className,
          })}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined
          }
          {...props}
        >
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
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helpText && (
          <p id={`${selectId}-help`} className="mt-2 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

/**
 * Select Group - Grouped options
 */
export interface SelectGroupOption {
  label: string;
  options: SelectOption[];
}

export interface GroupedSelectProps extends Omit<SelectProps, 'options'> {
  groups: SelectGroupOption[];
}

export const GroupedSelect = React.forwardRef<HTMLSelectElement, GroupedSelectProps>(
  ({ groups, ...props }, ref) => {
    const flatOptions = groups.flatMap((group) =>
      group.options.map((opt) => ({
        ...opt,
        groupLabel: group.label,
      }))
    );

    return (
      <Select
        ref={ref}
        {...props}
        options={flatOptions}
        // Override render
        children={groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      />
    );
  }
);

GroupedSelect.displayName = 'GroupedSelect';

