/**
 * @fileoverview Tabs component
 * 
 * Accessible tabs component with keyboard navigation and ARIA support
 */

'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Tabs context
 */
interface TabsContextValue {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
}

/**
 * Tabs props
 */
export interface TabsProps {
  /** Default selected tab */
  defaultValue?: string;
  /** Controlled selected tab */
  value?: string;
  /** Callback when tab changes */
  onValueChange?: (value: string) => void;
  /** Orientation of tabs */
  orientation?: 'horizontal' | 'vertical';
  /** Children */
  children: React.ReactNode;
  /** Class name */
  className?: string;
}

/**
 * Tabs root component
 */
export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = 'horizontal',
  children,
  className,
}: TabsProps) {
  const [selectedTab, setSelectedTab] = useState(
    controlledValue || defaultValue || ''
  );

  const isControlled = controlledValue !== undefined;

  const handleTabChange = (value: string) => {
    if (!isControlled) {
      setSelectedTab(value);
    }
    onValueChange?.(value);
  };

  const currentValue = isControlled ? controlledValue : selectedTab;

  return (
    <TabsContext.Provider
      value={{
        selectedTab: currentValue,
        setSelectedTab: handleTabChange,
        orientation,
      }}
    >
      <div
        className={cn('tabs', className)}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/**
 * TabsList props
 */
export interface TabsListProps {
  /** Children */
  children: React.ReactNode;
  /** Class name */
  className?: string;
  /** ARIA label */
  'aria-label'?: string;
}

/**
 * TabsList component
 */
export function TabsList({
  children,
  className,
  'aria-label': ariaLabel,
}: TabsListProps) {
  const { orientation } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const tabs = Array.from(
        list.querySelectorAll('[role="tab"]:not([disabled])')
      ) as HTMLElement[];

      const currentIndex = tabs.indexOf(document.activeElement as HTMLElement);
      if (currentIndex === -1) return;

      const isHorizontal = orientation === 'horizontal';
      let nextIndex = currentIndex;

      switch (event.key) {
        case isHorizontal ? 'ArrowRight' : 'ArrowDown':
          event.preventDefault();
          nextIndex = (currentIndex + 1) % tabs.length;
          break;

        case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
          event.preventDefault();
          nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
          break;

        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;

        case 'End':
          event.preventDefault();
          nextIndex = tabs.length - 1;
          break;

        default:
          return;
      }

      tabs[nextIndex]?.focus();
      tabs[nextIndex]?.click();
    };

    list.addEventListener('keydown', handleKeyDown);
    return () => list.removeEventListener('keydown', handleKeyDown);
  }, [orientation]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row border-b' : 'flex-col border-r',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * TabsTrigger props
 */
export interface TabsTriggerProps {
  /** Tab value */
  value: string;
  /** Children */
  children: React.ReactNode;
  /** Class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * TabsTrigger component
 */
export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
}: TabsTriggerProps) {
  const { selectedTab, setSelectedTab } = useTabsContext();
  const isSelected = selectedTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => setSelectedTab(value)}
      className={cn(
        'relative px-4 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * TabsContent props
 */
export interface TabsContentProps {
  /** Tab value */
  value: string;
  /** Children */
  children: React.ReactNode;
  /** Class name */
  className?: string;
  /** Force mount even when not selected */
  forceMount?: boolean;
}

/**
 * TabsContent component
 */
export function TabsContent({
  value,
  children,
  className,
  forceMount = false,
}: TabsContentProps) {
  const { selectedTab } = useTabsContext();
  const isSelected = selectedTab === value;

  if (!isSelected && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      hidden={!isSelected}
      className={cn(
        'mt-4 focus-visible:outline-none focus-visible:ring-2',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <Tabs defaultValue="account">
 *   <TabsList aria-label="Account settings">
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="password">Password</TabsTrigger>
 *     <TabsTrigger value="notifications">Notifications</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">
 *     Account content
 *   </TabsContent>
 *   <TabsContent value="password">
 *     Password content
 *   </TabsContent>
 *   <TabsContent value="notifications">
 *     Notifications content
 *   </TabsContent>
 * </Tabs>
 */
