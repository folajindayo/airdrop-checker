/**
 * Compound Component Patterns
 * 
 * Reusable compound components for complex UI widgets
 */

'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

// Tabs compound component
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<{
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}> = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        'rounded-md px-4 py-2 text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isActive
          ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100'
          : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700',
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn('mt-4', className)}>
      {children}
    </div>
  );
};

// Accordion compound component
interface AccordionContextType {
  openItems: string[];
  toggleItem: (item: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

export const Accordion: React.FC<{
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}> = ({ type = 'single', defaultValue, children, className }) => {
  const [openItems, setOpenItems] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  );

  const toggleItem = (item: string) => {
    setOpenItems((prev) => {
      if (type === 'single') {
        return prev.includes(item) ? [] : [item];
      }
      return prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn('space-y-2', className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700',
        className
      )}
      data-value={value}
    >
      {children}
    </div>
  );
};

export const AccordionTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const parentItem = React.useContext(AccordionItemContext);
  if (!parentItem) throw new Error('AccordionTrigger must be used within AccordionItem');

  const { openItems, toggleItem } = context;
  const isOpen = openItems.includes(parentItem);

  return (
    <button
      onClick={() => toggleItem(parentItem)}
      className={cn(
        'flex w-full items-center justify-between p-4 text-left font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
        className
      )}
    >
      {children}
      <svg
        className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

const AccordionItemContext = createContext<string | undefined>(undefined);

export const AccordionContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const parentItem = React.useContext(AccordionItemContext);
  if (!parentItem) throw new Error('AccordionContent must be used within AccordionItem');

  const { openItems } = context;
  const isOpen = openItems.includes(parentItem);

  if (!isOpen) return null;

  return (
    <div className={cn('border-t border-gray-200 p-4 dark:border-gray-700', className)}>
      {children}
    </div>
  );
};

// Enhance AccordionItem to provide context
const OriginalAccordionItem = AccordionItem;
export const EnhancedAccordionItem: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  return (
    <AccordionItemContext.Provider value={value}>
      <OriginalAccordionItem value={value} className={className}>
        {children}
      </OriginalAccordionItem>
    </AccordionItemContext.Provider>
  );
};

