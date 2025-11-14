/**
 * @fileoverview Tooltip component
 * 
 * Accessible tooltip component with keyboard support and ARIA attributes
 */

'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * Tooltip placement
 */
export type TooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

/**
 * Tooltip props
 */
export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Placement of tooltip */
  placement?: TooltipPlacement;
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Children (trigger element) */
  children: React.ReactElement;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Custom class for tooltip */
  className?: string;
  /** Custom class for arrow */
  arrowClassName?: string;
  /** Show arrow */
  showArrow?: boolean;
  /** Whether to use portal */
  usePortal?: boolean;
}

/**
 * Tooltip component
 */
export function Tooltip({
  content,
  placement = 'top',
  showDelay = 200,
  hideDelay = 0,
  children,
  disabled = false,
  className,
  arrowClassName,
  showArrow = true,
  usePortal = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const tooltipId = useId();

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 8;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;

      case 'top-start':
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.left;
        break;

      case 'top-end':
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.right - tooltipRect.width;
        break;

      case 'bottom':
        top = triggerRect.bottom + spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;

      case 'bottom-start':
        top = triggerRect.bottom + spacing;
        left = triggerRect.left;
        break;

      case 'bottom-end':
        top = triggerRect.bottom + spacing;
        left = triggerRect.right - tooltipRect.width;
        break;

      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - spacing;
        break;

      case 'left-start':
        top = triggerRect.top;
        left = triggerRect.left - tooltipRect.width - spacing;
        break;

      case 'left-end':
        top = triggerRect.bottom - tooltipRect.height;
        left = triggerRect.left - tooltipRect.width - spacing;
        break;

      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + spacing;
        break;

      case 'right-start':
        top = triggerRect.top;
        left = triggerRect.right + spacing;
        break;

      case 'right-end':
        top = triggerRect.bottom - tooltipRect.height;
        left = triggerRect.right + spacing;
        break;
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = spacing;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - spacing;
    }
    if (top < 0) top = spacing;
    if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - spacing;
    }

    setPosition({ top, left });
  };

  // Show tooltip
  const show = () => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  };

  // Hide tooltip
  const hide = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  // Update position when visible
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Clone child with ref and event handlers
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      show();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      hide();
    },
    'aria-describedby': isVisible ? tooltipId : undefined,
  });

  // Tooltip element
  const tooltipElement = isVisible && (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      className={cn(
        'absolute z-50 px-3 py-2 text-sm rounded-md shadow-md',
        'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
        'animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      data-state={isVisible ? 'open' : 'closed'}
    >
      {content}
      {showArrow && (
        <div
          className={cn(
            'absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45',
            placement.startsWith('top') && 'bottom-[-4px] left-1/2 -translate-x-1/2',
            placement.startsWith('bottom') && 'top-[-4px] left-1/2 -translate-x-1/2',
            placement.startsWith('left') && 'right-[-4px] top-1/2 -translate-y-1/2',
            placement.startsWith('right') && 'left-[-4px] top-1/2 -translate-y-1/2',
            arrowClassName
          )}
        />
      )}
    </div>
  );

  return (
    <>
      {trigger}
      {usePortal && typeof document !== 'undefined'
        ? createPortal(tooltipElement, document.body)
        : tooltipElement}
    </>
  );
}

/**
 * Simple tooltip variant without positioning logic
 */
export interface SimpleTooltipProps {
  /** Tooltip text */
  text: string;
  /** Children (trigger element) */
  children: React.ReactElement;
  /** Custom class */
  className?: string;
}

export function SimpleTooltip({
  text,
  children,
  className,
}: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  const trigger = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      setIsVisible(true);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      setIsVisible(false);
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      setIsVisible(true);
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      setIsVisible(false);
    },
    'aria-label': text,
    title: text,
  });

  return (
    <div className="relative inline-block">
      {trigger}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
            'px-3 py-2 text-sm rounded-md shadow-md whitespace-nowrap',
            'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <Tooltip content="This is a helpful tooltip">
 *   <button>Hover me</button>
 * </Tooltip>
 * 
 * <Tooltip content="Bottom tooltip" placement="bottom" showArrow={false}>
 *   <span>Another element</span>
 * </Tooltip>
 */
