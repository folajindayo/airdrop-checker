/**
 * Checkbox Component System
 * 
 * Unified checkbox components with comprehensive features:
 * - Checked, unchecked, and indeterminate states using CVA
 * - Disabled and error states
 * - Label and description
 * - Checkbox groups
 * - Custom styling with variants
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'border-gray-300 checked:bg-blue-600 checked:border-blue-600 focus:ring-blue-500',
        error: 'border-red-500 checked:bg-red-600 checked:border-red-600 focus:ring-red-500',
      },
      checkboxSize: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      checkboxSize: 'md',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

/**
 * Checkbox Component
 * 
 * A fully accessible checkbox component with support for
 * checked, unchecked, and indeterminate states.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      indeterminate = false,
      disabled = false,
      checked,
      variant,
      checkboxSize,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    // Set indeterminate state
    React.useEffect(() => {
      const checkbox = checkboxRef.current || (ref as any)?.current;
      if (checkbox) {
        checkbox.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    const checkboxVariant = error ? 'error' : variant;

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center">
          <input
            ref={(node) => {
              checkboxRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
              }
            }}
            id={inputId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? errorId
                : description
                ? descriptionId
                : undefined
            }
            className={cn(
              checkboxVariants({ variant: checkboxVariant, checkboxSize }),
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:bg-gray-900 dark:focus:ring-offset-gray-800'
            )}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="ml-3 flex-1">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'block text-sm font-medium',
                  disabled
                    ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                    : 'cursor-pointer text-gray-700 dark:text-gray-300'
                )}
              >
                {label}
                {props.required && <span className="ml-1 text-red-500">*</span>}
              </label>
            )}

            {description && (
              <p
                id={descriptionId}
                className={cn(
                  'mt-0.5 text-sm',
                  disabled
                    ? 'text-gray-400 dark:text-gray-600'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {description}
              </p>
            )}

            {error && (
              <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * Checkbox Group Component
 * 
 * Groups multiple checkboxes together with a common label.
 */
export interface CheckboxGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxGroupOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  checkboxSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value = [],
  onChange,
  label,
  description,
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  checkboxSize = 'md',
  className,
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange?.([...value, optionValue]);
    } else {
      onChange?.(value.filter((v) => v !== optionValue));
    }
  };

  const groupId = `checkbox-group-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${groupId}-error`;
  const descriptionId = `${groupId}-description`;

  return (
    <div className={cn('flex flex-col', className)} role="group" aria-labelledby={groupId}>
      {label && (
        <label
          id={groupId}
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {description && (
        <p
          id={descriptionId}
          className="mb-3 text-sm text-gray-500 dark:text-gray-400"
        >
          {description}
        </p>
      )}

      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            disabled={disabled || option.disabled}
            checkboxSize={checkboxSize}
            onChange={(e) => handleChange(option.value, e.target.checked)}
          />
        ))}
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Switch Component
 * 
 * A toggle switch styled as an on/off button.
 */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  error?: string;
  switchSize?: 'sm' | 'md' | 'lg';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      error,
      disabled = false,
      checked,
      switchSize = 'md',
      className,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${switchId}-error`;
    const descriptionId = `${switchId}-description`;

    const sizes = {
      sm: {
        container: 'h-5 w-9',
        toggle: 'h-4 w-4',
        translate: 'translate-x-4',
      },
      md: {
        container: 'h-6 w-11',
        toggle: 'h-5 w-5',
        translate: 'translate-x-5',
      },
      lg: {
        container: 'h-7 w-14',
        toggle: 'h-6 w-6',
        translate: 'translate-x-7',
      },
    };

    const size = sizes[switchSize];

    return (
      <div className={cn('flex items-start', className)}>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${switchId}-label` : undefined}
          aria-describedby={
            error ? errorId : description ? descriptionId : undefined
          }
          disabled={disabled}
          onClick={() => {
            const event = {
              target: { checked: !checked },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange?.(event);
          }}
          className={cn(
            'relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
            size.container
          )}
        >
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              checked ? size.translate : 'translate-x-0',
              size.toggle
            )}
          />
        </button>

        {(label || description) && (
          <div className="ml-3 flex-1">
            {label && (
              <label
                id={`${switchId}-label`}
                htmlFor={switchId}
                className={cn(
                  'block text-sm font-medium',
                  disabled
                    ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                    : 'cursor-pointer text-gray-700 dark:text-gray-300'
                )}
              >
                {label}
                {props.required && <span className="ml-1 text-red-500">*</span>}
              </label>
            )}

            {description && (
              <p
                id={descriptionId}
                className={cn(
                  'mt-0.5 text-sm',
                  disabled
                    ? 'text-gray-400 dark:text-gray-600'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {description}
              </p>
            )}

            {error && (
              <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

/**
 * Radio Component
 * 
 * A radio button for single selection from a group.
 */
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  radioSize?: 'sm' | 'md' | 'lg';
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      disabled = false,
      radioSize = 'md',
      className,
      id,
      ...props
    },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    const descriptionId = `${radioId}-description`;

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            disabled={disabled}
            aria-describedby={description ? descriptionId : undefined}
            className={cn(
              'border-gray-300 text-blue-600 transition-colors',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-offset-gray-800',
              sizeClasses[radioSize]
            )}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="ml-3 flex-1">
            {label && (
              <label
                htmlFor={radioId}
                className={cn(
                  'block text-sm font-medium',
                  disabled
                    ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                    : 'cursor-pointer text-gray-700 dark:text-gray-300'
                )}
              >
                {label}
              </label>
            )}

            {description && (
              <p
                id={descriptionId}
                className={cn(
                  'mt-0.5 text-sm',
                  disabled
                    ? 'text-gray-400 dark:text-gray-600'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

/**
 * Radio Group Component
 * 
 * Groups multiple radio buttons together for single selection.
 */
export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  radioSize?: 'sm' | 'md' | 'lg';
  name: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  label,
  description,
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  radioSize = 'md',
  name,
  className,
}) => {
  const handleChange = (optionValue: string) => {
    onChange?.(optionValue);
  };

  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${groupId}-error`;
  const descriptionId = `${groupId}-description`;

  return (
    <div className={cn('flex flex-col', className)} role="radiogroup" aria-labelledby={groupId}>
      {label && (
        <label
          id={groupId}
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {description && (
        <p
          id={descriptionId}
          className="mb-3 text-sm text-gray-500 dark:text-gray-400"
        >
          {description}
        </p>
      )}

      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            disabled={disabled || option.disabled}
            radioSize={radioSize}
            onChange={() => handleChange(option.value)}
          />
        ))}
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
