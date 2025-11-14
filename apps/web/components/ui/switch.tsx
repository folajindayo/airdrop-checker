/**
 * @fileoverview Switch component with controlled/uncontrolled states
 * @module components/ui/switch
 */

'use client';

import React, { useState, useId } from 'react';

/**
 * Switch component props
 */
export interface SwitchProps {
  /**
   * Whether the switch is checked (for controlled component)
   */
  checked?: boolean;

  /**
   * Default checked state (for uncontrolled component)
   */
  defaultChecked?: boolean;

  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;

  /**
   * Label text
   */
  label?: React.ReactNode;

  /**
   * Additional description text
   */
  description?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Accessible name
   */
  'aria-label'?: string;

  /**
   * ID for the input element
   */
  id?: string;

  /**
   * Name attribute for form submission
   */
  name?: string;

  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * Switch component for boolean input
 *
 * @example
 * ```tsx
 * // Controlled
 * <Switch checked={enabled} onChange={setEnabled} label="Enable notifications" />
 *
 * // Uncontrolled
 * <Switch defaultChecked={true} label="Remember me" />
 * ```
 */
export const Switch: React.FC<SwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  id: providedId,
  name,
  loading = false,
}) => {
  const generatedId = useId();
  const id = providedId || generatedId;

  // Support both controlled and uncontrolled usage
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  };

  const sizeClasses = {
    sm: {
      track: 'h-4 w-8',
      thumb: 'h-3 w-3',
      thumbTranslate: 'translate-x-4',
      loader: 'h-2 w-2',
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-5 w-5',
      thumbTranslate: 'translate-x-5',
      loader: 'h-3 w-3',
    },
    lg: {
      track: 'h-7 w-14',
      thumb: 'h-6 w-6',
      thumbTranslate: 'translate-x-7',
      loader: 'h-4 w-4',
    },
  };

  const sizes = sizeClasses[size];

  const baseTrackClasses =
    'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  const trackStateClasses = checked
    ? 'bg-blue-600 focus-visible:outline-blue-600'
    : 'bg-gray-200 focus-visible:outline-gray-500';

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className={`flex items-start ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled || loading}
        onClick={() => {
          if (!disabled && !loading) {
            const newChecked = !checked;
            if (!isControlled) {
              setInternalChecked(newChecked);
            }
            onChange?.(newChecked);
          }
        }}
        className={`${baseTrackClasses} ${trackStateClasses} ${disabledClasses} ${sizes.track}`}
      >
        <span className="sr-only">
          {ariaLabel || (typeof label === 'string' ? label : 'Toggle')}
        </span>
        <span
          aria-hidden="true"
          className={`${sizes.thumb} pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? sizes.thumbTranslate : 'translate-x-0'
          } flex items-center justify-center`}
        >
          {loading && (
            <span
              className={`${sizes.loader} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
            />
          )}
        </span>
      </button>

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="checkbox"
          name={name}
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled || loading}
          className="sr-only"
          aria-hidden="true"
        />
      )}

      {(label || description) && (
        <div className="ml-3 flex-1">
          {label && (
            <label
              id={`${id}-label`}
              htmlFor={id}
              className={`text-sm font-medium text-gray-900 ${
                disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={`${id}-description`} className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

Switch.displayName = 'Switch';

/**
 * Switch Group component for managing multiple related switches
 */
export interface SwitchGroupProps {
  /**
   * Group label
   */
  label?: string;

  /**
   * Group description
   */
  description?: string;

  /**
   * Children switches
   */
  children: React.ReactNode;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Switch Group component
 *
 * @example
 * ```tsx
 * <SwitchGroup label="Notification Settings">
 *   <Switch label="Email notifications" />
 *   <Switch label="Push notifications" />
 *   <Switch label="SMS notifications" />
 * </SwitchGroup>
 * ```
 */
export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  label,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`} role="group" aria-labelledby={label ? 'group-label' : undefined}>
      {(label || description) && (
        <div>
          {label && (
            <h3 id="group-label" className="text-sm font-medium text-gray-900">
              {label}
            </h3>
          )}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
};

SwitchGroup.displayName = 'SwitchGroup';
