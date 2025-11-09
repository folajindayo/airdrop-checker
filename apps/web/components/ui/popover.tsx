'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };

// Popover with close button
export function PopoverWithClose({
  trigger,
  children,
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className={className}>
        {children}
        <PopoverPrimitive.Close className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 15 15"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5l3.469-3.468Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only">Close</span>
        </PopoverPrimitive.Close>
      </PopoverContent>
    </Popover>
  );
}

// Info popover (for help text)
export function InfoPopover({
  trigger,
  title,
  description,
  className,
}: {
  trigger?: React.ReactNode;
  title?: string;
  description: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <button className="inline-flex items-center justify-center rounded-full h-5 w-5 text-xs bg-muted hover:bg-muted/80 transition-colors">
            ?
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className={cn('w-80', className)}>
        {title && <h4 className="font-medium mb-2">{title}</h4>}
        <p className="text-sm text-muted-foreground">{description}</p>
      </PopoverContent>
    </Popover>
  );
}

// Menu popover (for contextual actions)
export function MenuPopover({
  trigger,
  items,
  className,
}: {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    destructive?: boolean;
    disabled?: boolean;
  }>;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className={cn('w-56 p-0', className)}>
        <div className="flex flex-col">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              disabled={item.disabled}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                item.destructive && 'text-red-600 hover:bg-red-50',
                index === 0 && 'rounded-t-md',
                index === items.length - 1 && 'rounded-b-md'
              )}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Form popover (for inline forms)
export function FormPopover({
  trigger,
  title,
  children,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  className,
}: {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = () => {
    onSubmit();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className={cn('w-80', className)}>
        <div className="space-y-4">
          <h4 className="font-medium">{title}</h4>
          {children}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Compact popover (no padding)
export function CompactPopover({
  trigger,
  children,
  align = 'center',
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className={cn('p-0', className)}>
        {children}
      </PopoverContent>
    </Popover>
  );
}

