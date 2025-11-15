'use client';

import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

const CollapsibleContent = CollapsiblePrimitive.Content;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

// Collapsible with icon
export function CollapsibleWithIcon({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={className}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-4 hover:bg-accent transition-colors">
        <span className="font-medium">{title}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Card collapsible
export function CollapsibleCard({
  title,
  subtitle,
  children,
  defaultOpen = false,
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`border rounded-lg ${className}`}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent transition-colors">
        <div className="flex items-center gap-3">
          {icon && <div>{icon}</div>}
          <div className="text-left">
            <div className="font-medium">{title}</div>
            {subtitle && (
              <div className="text-sm text-muted-foreground">{subtitle}</div>
            )}
          </div>
        </div>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t">
        <div className="p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Multiple collapsibles (accordion-like)
export function CollapsibleGroup({
  items,
  allowMultiple = false,
  className,
}: {
  items: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    defaultOpen?: boolean;
  }>;
  allowMultiple?: boolean;
  className?: string;
}) {
  const [openItems, setOpenItems] = React.useState<string[]>(
    items.filter((item) => item.defaultOpen).map((item) => item.id)
  );

  const handleToggle = (itemId: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setOpenItems((prev) => (prev.includes(itemId) ? [] : [itemId]));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <Collapsible
          key={item.id}
          open={openItems.includes(item.id)}
          onOpenChange={() => handleToggle(item.id)}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-4 hover:bg-accent transition-colors">
            <span className="font-medium">{item.title}</span>
            <svg
              className={`h-4 w-4 transition-transform ${
                openItems.includes(item.id) ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 pt-2">
            {item.content}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

// Animated height collapsible
export function AnimatedCollapsible({
  trigger,
  children,
  defaultOpen = false,
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={className}
    >
      <CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

