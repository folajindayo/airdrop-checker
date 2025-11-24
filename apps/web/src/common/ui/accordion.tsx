/**
 * @fileoverview Accordion component
 * 
 * Accessible accordion component with keyboard navigation and ARIA support
 */

'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Accordion context
 */
interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
  collapsible?: boolean;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(
  undefined
);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      'Accordion components must be used within an Accordion component'
    );
  }
  return context;
}

/**
 * Accordion props
 */
export interface AccordionProps {
  /** Type of accordion (single or multiple items open) */
  type?: 'single' | 'multiple';
  /** Default open items */
  defaultValue?: string | string[];
  /** Controlled open items */
  value?: string | string[];
  /** Callback when items change */
  onValueChange?: (value: string | string[]) => void;
  /** Allow collapsing all items (for single type) */
  collapsible?: boolean;
  /** Children */
  children: React.ReactNode;
  /** Class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Accordion root component
 */
export function Accordion({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  collapsible = false,
  children,
  className,
  disabled = false,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (controlledValue !== undefined) {
      return Array.isArray(controlledValue) ? controlledValue : [controlledValue];
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const isControlled = controlledValue !== undefined;

  const toggleItem = (value: string) => {
    if (disabled) return;

    let newOpenItems: string[];

    if (type === 'single') {
      if (openItems.includes(value)) {
        // Closing current item
        newOpenItems = collapsible ? [] : openItems;
      } else {
        // Opening new item
        newOpenItems = [value];
      }
    } else {
      // Multiple type
      if (openItems.includes(value)) {
        newOpenItems = openItems.filter((item) => item !== value);
      } else {
        newOpenItems = [...openItems, value];
      }
    }

    if (!isControlled) {
      setOpenItems(newOpenItems);
    }

    const callbackValue =
      type === 'single' ? newOpenItems[0] || '' : newOpenItems;
    onValueChange?.(callbackValue);
  };

  const currentOpenItems = isControlled
    ? Array.isArray(controlledValue)
      ? controlledValue
      : [controlledValue]
    : openItems;

  return (
    <AccordionContext.Provider
      value={{
        openItems: currentOpenItems.filter(Boolean),
        toggleItem,
        type,
        collapsible,
      }}
    >
      <div className={cn('accordion', className)} data-disabled={disabled}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

/**
 * AccordionItem context
 */
interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = createContext<
  AccordionItemContextValue | undefined
>(undefined);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      'AccordionTrigger and AccordionContent must be used within an AccordionItem'
    );
  }
  return context;
}

/**
 * AccordionItem props
 */
export interface AccordionItemProps {
  /** Item value */
  value: string;
  /** Children */
  children: React.ReactNode;
  /** Class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * AccordionItem component
 */
export function AccordionItem({
  value,
  children,
  className,
  disabled = false,
}: AccordionItemProps) {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        className={cn('border-b', className)}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

/**
 * AccordionTrigger props
 */
export interface AccordionTriggerProps {
  /** Children */
  children: React.ReactNode;
  /** Class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * AccordionTrigger component
 */
export function AccordionTrigger({
  children,
  className,
  disabled = false,
}: AccordionTriggerProps) {
  const { toggleItem } = useAccordionContext();
  const { value, isOpen } = useAccordionItemContext();
  const triggerId = `accordion-trigger-${value}`;
  const contentId = `accordion-content-${value}`;

  return (
    <h3 className="flex">
      <button
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={disabled}
        onClick={() => toggleItem(value)}
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-medium transition-all',
          'hover:underline focus-visible:outline-none focus-visible:ring-2',
          'disabled:pointer-events-none disabled:opacity-50',
          '[&[data-state=open]>svg]:rotate-180',
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          aria-hidden="true"
        >
          <path
            d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </h3>
  );
}

/**
 * AccordionContent props
 */
export interface AccordionContentProps {
  /** Children */
  children: React.ReactNode;
  /** Class name */
  className?: string;
}

/**
 * AccordionContent component
 */
export function AccordionContent({
  children,
  className,
}: AccordionContentProps) {
  const { value, isOpen } = useAccordionItemContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = `accordion-content-${value}`;
  const triggerId = `accordion-trigger-${value}`;

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (isOpen) {
      content.style.height = `${content.scrollHeight}px`;
    } else {
      content.style.height = '0px';
    }
  }, [isOpen]);

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!isOpen}
      className={cn(
        'overflow-hidden transition-all duration-200',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      style={{
        height: isOpen ? 'auto' : 0,
      }}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
}

/**
 * Example usage:
 * 
 * <Accordion type="single" defaultValue="item-1" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Is it accessible?</AccordionTrigger>
 *     <AccordionContent>
 *       Yes. It adheres to the WAI-ARIA design pattern.
 *     </AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="item-2">
 *     <AccordionTrigger>Is it styled?</AccordionTrigger>
 *     <AccordionContent>
 *       Yes. It comes with default styles that match your design system.
 *     </AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
