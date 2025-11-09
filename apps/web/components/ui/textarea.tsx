import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

// Textarea with character count
export function TextareaWithCount({
  value,
  onChange,
  maxLength,
  label,
  placeholder,
  rows = 4,
  className,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  error?: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none">{label}</label>
      )}
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={error ? 'border-red-500' : ''}
      />
      <div className="flex items-center justify-between">
        {error ? (
          <span className="text-sm text-red-500">{error}</span>
        ) : (
          <span /> 
        )}
        {maxLength && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

// Auto-resizing textarea
export function AutoResizeTextarea({
  value,
  onChange,
  minRows = 3,
  maxRows = 10,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
  maxRows?: number;
  placeholder?: string;
  className?: string;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(
        getComputedStyle(textareaRef.current).lineHeight
      );
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value, minRows, maxRows]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden',
        className
      )}
      style={{ minHeight: `${minRows * 1.5}rem` }}
    />
  );
}

// Textarea with label and helper text
export function TextareaWithLabel({
  label,
  helperText,
  error,
  required,
  ...props
}: TextareaProps & {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Textarea
        {...props}
        className={cn(props.className, error && 'border-red-500')}
      />
      {(helperText || error) && (
        <p
          className={cn(
            'text-sm',
            error ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// Code editor style textarea
export function CodeTextarea({
  value,
  onChange,
  language,
  placeholder,
  rows = 10,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        spellCheck={false}
      />
      {language && (
        <span className="absolute top-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
          {language}
        </span>
      )}
    </div>
  );
}

