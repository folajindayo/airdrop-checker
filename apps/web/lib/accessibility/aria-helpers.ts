/**
 * @fileoverview ARIA helpers and accessibility utilities
 * @module lib/accessibility/aria-helpers
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Generate unique ID for ARIA attributes
 */
export function useAriaId(prefix = 'aria'): string {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
}

/**
 * Announce message to screen readers
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  // Find or create live region
  let liveRegion = document.getElementById(`aria-live-${priority}`);

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = `aria-live-${priority}`;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  // Clear and set new message
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);
}

/**
 * Hook to announce messages
 */
export function useAnnounce(): (
  message: string,
  priority?: 'polite' | 'assertive'
) => void {
  return announce;
}

/**
 * Focus trap hook for modals and dialogs
 */
export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return ref;
}

/**
 * Roving tabindex hook for keyboard navigation
 */
export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
} {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { key } = e;

    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

    if (key === nextKey) {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      setCurrentIndex(nextIndex);
      items[nextIndex]?.focus();
    } else if (key === prevKey) {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      setCurrentIndex(prevIndex);
      items[prevIndex]?.focus();
    } else if (key === 'Home') {
      e.preventDefault();
      setCurrentIndex(0);
      items[0]?.focus();
    } else if (key === 'End') {
      e.preventDefault();
      const lastIndex = items.length - 1;
      setCurrentIndex(lastIndex);
      items[lastIndex]?.focus();
    }
  };

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
}

/**
 * Skip navigation link component helpers
 */
export const skipNav = {
  /**
   * Create skip link target ID
   */
  createTargetId: (label: string): string => {
    return `skip-to-${label.toLowerCase().replace(/\s+/g, '-')}`;
  },

  /**
   * Skip link styles
   */
  styles: {
    position: 'absolute' as const,
    left: '-10000px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden' as const,
    focus: {
      position: 'fixed' as const,
      top: '0',
      left: '0',
      width: 'auto',
      height: 'auto',
      overflow: 'visible' as const,
      zIndex: 9999,
      padding: '1rem',
      background: '#000',
      color: '#fff',
    },
  },
};

/**
 * ARIA describedby helper
 */
export function useAriaDescribedBy(
  descriptions: Array<string | undefined>
): string | undefined {
  const validDescriptions = descriptions.filter(Boolean) as string[];
  return validDescriptions.length > 0 ? validDescriptions.join(' ') : undefined;
}

/**
 * ARIA labelledby helper
 */
export function useAriaLabelledBy(
  labels: Array<string | undefined>
): string | undefined {
  const validLabels = labels.filter(Boolean) as string[];
  return validLabels.length > 0 ? validLabels.join(' ') : undefined;
}

/**
 * Keyboard shortcut helper
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (e: KeyboardEvent) => void;
  description: string;
}

/**
 * Register keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const matchesShift = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const matchesAlt = shortcut.alt ? e.altKey : !e.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          e.preventDefault();
          shortcut.handler(e);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

/**
 * Focus visible helper (keyboard vs mouse)
 */
export function useFocusVisible(): {
  isFocusVisible: boolean;
  focusVisibleProps: {
    onMouseDown: () => void;
    onKeyDown: () => void;
  };
} {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  return {
    isFocusVisible,
    focusVisibleProps: {
      onMouseDown: () => setIsFocusVisible(false),
      onKeyDown: () => setIsFocusVisible(true),
    },
  };
}

/**
 * Reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * High contrast mode detection
 */
export function useHighContrastMode(): boolean {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows High Contrast mode
      const test = document.createElement('div');
      test.style.borderColor = 'rgb(1, 2, 3)';
      test.style.borderStyle = 'solid';
      test.style.borderWidth = '1px';
      test.style.position = 'absolute';
      test.style.top = '-1000px';
      document.body.appendChild(test);

      const computed = window.getComputedStyle(test);
      const isHighContrast = computed.borderColor !== 'rgb(1, 2, 3)';

      document.body.removeChild(test);
      setHighContrast(isHighContrast);
    };

    checkHighContrast();
  }, []);

  return highContrast;
}

/**
 * Screen reader only text helper
 */
export const srOnly = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden' as const,
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: '0',
};

/**
 * Visually hidden but accessible
 */
export function visuallyHidden(text: string): React.ReactNode {
  return (
    <span style={srOnly} aria-live="polite">
      {text}
    </span>
  );
}

/**
 * ARIA expanded state helper
 */
export function useAriaExpanded(
  initialState = false
): [boolean, () => void, { 'aria-expanded': boolean }] {
  const [isExpanded, setIsExpanded] = useState(initialState);

  const toggle = () => setIsExpanded(!isExpanded);

  return [
    isExpanded,
    toggle,
    {
      'aria-expanded': isExpanded,
    },
  ];
}

/**
 * ARIA pressed state helper
 */
export function useAriaPressed(
  initialState = false
): [boolean, () => void, { 'aria-pressed': boolean }] {
  const [isPressed, setIsPressed] = useState(initialState);

  const toggle = () => setIsPressed(!isPressed);

  return [
    isPressed,
    toggle,
    {
      'aria-pressed': isPressed,
    },
  ];
}

/**
 * ARIA selected state helper
 */
export function useAriaSelected(
  initialState = false
): [boolean, (selected: boolean) => void, { 'aria-selected': boolean }] {
  const [isSelected, setIsSelected] = useState(initialState);

  return [
    isSelected,
    setIsSelected,
    {
      'aria-selected': isSelected,
    },
  ];
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('tabindex') === '-1') return false;

  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (focusableTags.includes(element.tagName)) return true;

  return element.hasAttribute('tabindex');
}

/**
 * Get all focusable elements within container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => isFocusable(el)
  );
}

/**
 * Move focus to element
 */
export function moveFocus(element: HTMLElement | null, preventScroll = false): void {
  element?.focus({ preventScroll });
}

/**
 * Focus first element in container
 */
export function focusFirst(container: HTMLElement): void {
  const focusable = getFocusableElements(container);
  moveFocus(focusable[0]);
}

/**
 * Focus last element in container
 */
export function focusLast(container: HTMLElement): void {
  const focusable = getFocusableElements(container);
  moveFocus(focusable[focusable.length - 1]);
}

