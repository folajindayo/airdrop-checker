/**
 * Select Component
 * 
 * Dropdown select input with consistent styling and variants
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:ring-blue-500 dark:border-gray-700',
        error: 'border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:ring-green-500',
      },
      selectSize: {
        sm: 'h-8 text-sm px-3',
        md: 'h-10 text-base px-4',
        lg: 'h-12 text-lg px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
);

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, selectSize, label, error, helperText, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(selectVariants({ variant: error ? 'error' : variant, selectSize }), className)}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Multi-select component (for advanced use)
export interface MultiSelectProps extends Omit<SelectProps, 'children'> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  selectedValues?: string[];
  onSelectionChange?: (values: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues = [],
  onSelectionChange,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    onSelectionChange?.(selected);
  };

  return (
    <Select
      {...props}
      multiple
      value={selectedValues}
      onChange={handleChange}
      className={cn('py-2', className)}
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
    </Select>
  );
};
