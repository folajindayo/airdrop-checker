import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success:
          'border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50 [&>svg]:text-green-600',
        warning:
          'border-yellow-500/50 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50 [&>svg]:text-yellow-600',
        info:
          'border-blue-500/50 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-50 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };

// Dismissible Alert
export function DismissibleAlert({
  variant = 'default',
  title,
  description,
  onDismiss,
  className,
  icon,
}: {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
}) {
  const [visible, setVisible] = React.useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  const defaultIcons = {
    default: <Info className="h-4 w-4" />,
    destructive: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  return (
    <Alert variant={variant} className={cn('pr-12', className)}>
      {icon || defaultIcons[variant]}
      <div>
        <AlertTitle>{title}</AlertTitle>
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}

// Banner Alert (full width, sticky)
export function BannerAlert({
  variant = 'info',
  title,
  description,
  action,
  onDismiss,
  className,
}: {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}) {
  const [visible, setVisible] = React.useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  const colorClasses = {
    default: 'bg-background border-border',
    destructive: 'bg-red-50 border-red-200 dark:bg-red-950',
    success: 'bg-green-50 border-green-200 dark:bg-green-950',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950',
  };

  return (
    <div
      className={cn(
        'w-full border-b py-3 px-4',
        colorClasses[variant],
        className
      )}
    >
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <Button size="sm" variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline Alert (compact)
export function InlineAlert({
  variant = 'info',
  children,
  className,
}: {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}) {
  const icons = {
    default: <Info className="h-4 w-4" />,
    destructive: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  const colorClasses = {
    default: 'bg-background text-foreground',
    destructive: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-50',
    success: 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50',
    warning: 'bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50',
    info: 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-50',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md p-3 text-sm',
        colorClasses[variant],
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1">{children}</div>
    </div>
  );
}

// Alert with action buttons
export function AlertWithActions({
  variant = 'default',
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}) {
  const icons = {
    default: <Info className="h-4 w-4" />,
    destructive: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  return (
    <Alert variant={variant} className={className}>
      {icons[variant]}
      <div className="space-y-3">
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </div>
        {(primaryAction || secondaryAction) && (
          <div className="flex gap-2">
            {primaryAction && (
              <Button size="sm" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                size="sm"
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
}

