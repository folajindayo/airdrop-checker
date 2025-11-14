/**
 * Alert Component
 * Alert boxes for messages, warnings, and notifications
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative rounded-lg border p-4 transition-all',
  {
    variants: {
      variant: {
        default: 'bg-gray-50 border-gray-200 text-gray-900',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * Alert title
   */
  title?: string;
  
  /**
   * Alert description
   */
  description?: string;
  
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;
  
  /**
   * Dismiss handler
   */
  onDismiss?: () => void;
}

/**
 * Alert component for messages and notifications
 * 
 * @example
 * ```tsx
 * <Alert variant="success" title="Success!">
 *   Your changes have been saved.
 * </Alert>
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      title,
      description,
      icon,
      dismissible,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    if (dismissed) return null;

    const icons = {
      default: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      info: (
        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      success: (
        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      warning: (
        <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      error: (
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    };

    const defaultIcon = variant ? icons[variant] : icons.default;

    return (
      <div
        ref={ref}
        role="alert"
        className={alertVariants({ variant, className })}
        {...props}
      >
        <div className="flex">
          {(icon || defaultIcon) && (
            <div className="flex-shrink-0">{icon || defaultIcon}</div>
          )}
          <div className={`flex-1 ${icon || defaultIcon ? 'ml-3' : ''}`}>
            {title && (
              <h3 className="text-sm font-medium">{title}</h3>
            )}
            {description && (
              <div className={`text-sm ${title ? 'mt-2' : ''}`}>
                {description}
              </div>
            )}
            {children && (
              <div className={`text-sm ${title || description ? 'mt-2' : ''}`}>
                {children}
              </div>
            )}
          </div>
          {dismissible && (
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-black/5"
                aria-label="Dismiss alert"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

/**
 * Alert with actions
 */
export interface AlertWithActionsProps extends AlertProps {
  actions?: React.ReactNode;
}

export const AlertWithActions: React.FC<AlertWithActionsProps> = ({
  actions,
  children,
  ...props
}) => {
  return (
    <Alert {...props}>
      {children}
      {actions && (
        <div className="mt-4 flex gap-2">
          {actions}
        </div>
      )}
    </Alert>
  );
};

/**
 * Inline Alert - Compact version
 */
export interface InlineAlertProps extends Omit<AlertProps, 'title' | 'description'> {
  message: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  message,
  variant = 'default',
  ...props
}) => {
  return (
    <Alert variant={variant} {...props}>
      <span className="text-sm font-medium">{message}</span>
    </Alert>
  );
};

