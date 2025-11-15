/**
 * Checkbox Component
 * Accessible checkbox component with label and states
 */

import React from 'react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Description text below label
   */
  description?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Whether the checkbox is indeterminate
   */
  indeterminate?: boolean;
}

/**
 * Checkbox component with label and states
 * 
 * @example
 * ```tsx
 * <Checkbox label="Accept terms" />
 * <Checkbox label="Notifications" description="Receive email notifications" />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className = '',
      label,
      description,
      error,
      indeterminate,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${React.useId()}`;
    const hasError = Boolean(error);

    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => checkboxRef.current!);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate || false;
      }
    }, [indeterminate]);

    return (
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <input
            ref={checkboxRef}
            type="checkbox"
            id={checkboxId}
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              hasError ? 'border-red-500' : ''
            } ${className}`}
            aria-invalid={hasError}
            aria-describedby={error ? `${checkboxId}-error` : undefined}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`font-medium ${
                  hasError ? 'text-red-900' : 'text-gray-900'
                } ${props.disabled ? 'opacity-50' : 'cursor-pointer'}`}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={`${hasError ? 'text-red-700' : 'text-gray-500'} ${
                  label ? 'mt-1' : ''
                }`}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * Checkbox Group Component
 */
export interface CheckboxGroupOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /**
   * Group label
   */
  label?: string;
  
  /**
   * Help text
   */
  helpText?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Checkbox options
   */
  options: CheckboxGroupOption[];
  
  /**
   * Selected values
   */
  value?: string[];
  
  /**
   * Change handler
   */
  onChange?: (values: string[]) => void;
  
  /**
   * Whether all checkboxes are disabled
   */
  disabled?: boolean;
  
  /**
   * Required field indicator
   */
  required?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  helpText,
  error,
  options,
  value = [],
  onChange,
  disabled,
  required,
}) => {
  const groupId = `checkbox-group-${React.useId()}`;
  const hasError = Boolean(error);

  const handleChange = (optionValue: string, checked: boolean) => {
    if (!onChange) return;

    const newValue = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);

    onChange(newValue);
  };

  return (
    <div role="group" aria-labelledby={`${groupId}-label`}>
      {label && (
        <label
          id={`${groupId}-label`}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="space-y-3">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            disabled={disabled || option.disabled}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {!error && helpText && (
        <p className="mt-2 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

/**
 * Switch Component (Toggle)
 */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Size of the switch
   */
  size?: 'sm' | 'md' | 'lg';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className = '',
      label,
      description,
      size = 'md',
      id,
      checked,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${React.useId()}`;

    const sizes = {
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: checked ? 'translate-x-4' : 'translate-x-0',
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: checked ? 'translate-x-5' : 'translate-x-0',
      },
      lg: {
        track: 'h-7 w-14',
        thumb: 'h-6 w-6',
        translate: checked ? 'translate-x-7' : 'translate-x-0',
      },
    };

    const sizeClass = sizes[size];

    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={switchId}
              className={`text-sm font-medium text-gray-900 ${
                props.disabled ? 'opacity-50' : 'cursor-pointer'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={(e) => {
            const event = e as any;
            event.target.checked = !checked;
            props.onChange?.(event);
          }}
          disabled={props.disabled}
          className={`relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            sizeClass.track
          } ${checked ? 'bg-blue-600' : 'bg-gray-200'} ${className}`}
        >
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            checked={checked}
            className="sr-only"
            {...props}
          />
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              sizeClass.thumb
            } ${sizeClass.translate}`}
          />
        </button>
      </div>
    );
  }
);

Switch.displayName = 'Switch';

