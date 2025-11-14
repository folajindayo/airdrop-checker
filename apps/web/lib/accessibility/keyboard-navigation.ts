/**
 * @fileoverview Keyboard navigation utilities
 * 
 * Provides utilities for implementing accessible keyboard navigation patterns
 * including focus management, keyboard shortcuts, and navigation helpers.
 */

import { RefObject, useEffect, useRef } from 'react';

/**
 * Keyboard key codes
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Focus trap options
 */
export interface FocusTrapOptions {
  /** Initial element to focus */
  initialFocus?: HTMLElement;
  /** Return focus to this element when trap is disabled */
  returnFocus?: HTMLElement;
  /** Whether to allow outside click */
  allowOutsideClick?: boolean;
}

/**
 * Focus trap manager
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousActiveElement: Element | null = null;
  private isActive = false;

  constructor(container: HTMLElement, private options: FocusTrapOptions = {}) {
    this.container = container;
  }

  /**
   * Activate the focus trap
   */
  activate(): void {
    if (this.isActive) return;

    this.previousActiveElement = document.activeElement;
    this.isActive = true;

    // Focus initial element or first focusable
    const initialElement = 
      this.options.initialFocus || 
      this.getFirstFocusableElement();
    
    if (initialElement) {
      initialElement.focus();
    }

    // Add event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    
    if (!this.options.allowOutsideClick) {
      document.addEventListener('click', this.handleOutsideClick);
    }
  }

  /**
   * Deactivate the focus trap
   */
  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleOutsideClick);

    // Return focus
    const returnElement = 
      this.options.returnFocus || 
      this.previousActiveElement;
    
    if (returnElement && returnElement instanceof HTMLElement) {
      returnElement.focus();
    }
  }

  /**
   * Handle Tab key navigation
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== Keys.TAB) return;

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  /**
   * Handle clicks outside the container
   */
  private handleOutsideClick = (event: MouseEvent): void => {
    const target = event.target as Node;
    
    if (!this.container.contains(target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /**
   * Get all focusable elements in the container
   */
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[];
  }

  /**
   * Get the first focusable element
   */
  private getFirstFocusableElement(): HTMLElement | null {
    const elements = this.getFocusableElements();
    return elements[0] || null;
  }
}

/**
 * Create a focus trap in an element
 */
export function createFocusTrap(
  container: HTMLElement,
  options?: FocusTrapOptions
): FocusTrap {
  return new FocusTrap(container, options);
}

/**
 * Hook for using focus trap
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean,
  options?: FocusTrapOptions
): RefObject<T> {
  const ref = useRef<T>(null);
  const trapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (isActive) {
      trapRef.current = createFocusTrap(ref.current, options);
      trapRef.current.activate();
    } else {
      trapRef.current?.deactivate();
      trapRef.current = null;
    }

    return () => {
      trapRef.current?.deactivate();
    };
  }, [isActive, options]);

  return ref;
}

/**
 * Roving tabindex manager for managing focus in a group
 */
export class RovingTabIndexManager {
  private items: HTMLElement[] = [];
  private currentIndex = 0;

  constructor(
    private container: HTMLElement,
    private orientation: 'horizontal' | 'vertical' = 'horizontal'
  ) {
    this.updateItems();
    this.attachEventListeners();
  }

  /**
   * Update the list of managed items
   */
  updateItems(): void {
    this.items = Array.from(
      this.container.querySelectorAll('[role="menuitem"], [role="option"], [role="tab"]')
    ) as HTMLElement[];

    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
    });
  }

  /**
   * Focus an item by index
   */
  focusItem(index: number): void {
    if (index < 0 || index >= this.items.length) return;

    // Update tabindex
    this.items[this.currentIndex]?.setAttribute('tabindex', '-1');
    this.items[index].setAttribute('tabindex', '0');
    this.items[index].focus();

    this.currentIndex = index;
  }

  /**
   * Focus the next item
   */
  focusNext(): void {
    const nextIndex = (this.currentIndex + 1) % this.items.length;
    this.focusItem(nextIndex);
  }

  /**
   * Focus the previous item
   */
  focusPrevious(): void {
    const prevIndex = 
      this.currentIndex === 0 
        ? this.items.length - 1 
        : this.currentIndex - 1;
    this.focusItem(prevIndex);
  }

  /**
   * Focus the first item
   */
  focusFirst(): void {
    this.focusItem(0);
  }

  /**
   * Focus the last item
   */
  focusLast(): void {
    this.focusItem(this.items.length - 1);
  }

  /**
   * Attach keyboard event listeners
   */
  private attachEventListeners(): void {
    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    const { key } = event;

    const isHorizontal = this.orientation === 'horizontal';
    const nextKey = isHorizontal ? Keys.ARROW_RIGHT : Keys.ARROW_DOWN;
    const prevKey = isHorizontal ? Keys.ARROW_LEFT : Keys.ARROW_UP;

    switch (key) {
      case nextKey:
        event.preventDefault();
        this.focusNext();
        break;

      case prevKey:
        event.preventDefault();
        this.focusPrevious();
        break;

      case Keys.HOME:
        event.preventDefault();
        this.focusFirst();
        break;

      case Keys.END:
        event.preventDefault();
        this.focusLast();
        break;
    }
  };

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
  }
}

/**
 * Create a roving tabindex manager
 */
export function createRovingTabIndex(
  container: HTMLElement,
  orientation?: 'horizontal' | 'vertical'
): RovingTabIndexManager {
  return new RovingTabIndexManager(container, orientation);
}

/**
 * Skip to content link helper
 */
export function createSkipLink(
  targetId: string,
  options: {
    text?: string;
    className?: string;
  } = {}
): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = options.text || 'Skip to main content';
  link.className = options.className || 'skip-link';

  // Style for screen reader only (visually hidden but accessible)
  Object.assign(link.style, {
    position: 'absolute',
    left: '-10000px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  });

  // Show on focus
  link.addEventListener('focus', () => {
    Object.assign(link.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: 'auto',
      height: 'auto',
      overflow: 'visible',
      zIndex: '9999',
      padding: '1rem',
      background: '#000',
      color: '#fff',
    });
  });

  link.addEventListener('blur', () => {
    Object.assign(link.style, {
      position: 'absolute',
      left: '-10000px',
      top: 'auto',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    });
  });

  return link;
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  // Style for screen reader only
  Object.assign(announcement.style, {
    position: 'absolute',
    left: '-10000px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  });

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;

  if (
    (element as HTMLInputElement).disabled ||
    element.getAttribute('aria-disabled') === 'true'
  ) {
    return false;
  }

  const tagName = element.tagName.toLowerCase();
  
  if (tagName === 'a') {
    return !!(element as HTMLAnchorElement).href;
  }

  if (['input', 'select', 'textarea', 'button'].includes(tagName)) {
    return true;
  }

  if (element.hasAttribute('tabindex')) {
    return true;
  }

  return false;
}

/**
 * Get all focusable elements in a container
 */
export function getFocusableElements(
  container: HTMLElement = document.body
): HTMLElement[] {
  const selector = [
    'a[href]',
    'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
}

/**
 * Focus first element in container
 */
export function focusFirst(container: HTMLElement): boolean {
  const elements = getFocusableElements(container);
  
  if (elements.length > 0) {
    elements[0].focus();
    return true;
  }

  return false;
}

/**
 * Focus last element in container
 */
export function focusLast(container: HTMLElement): boolean {
  const elements = getFocusableElements(container);
  
  if (elements.length > 0) {
    elements[elements.length - 1].focus();
    return true;
  }

  return false;
}

/**
 * Keyboard shortcut manager
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

export class KeyboardShortcutManager {
  private shortcuts = new Map<string, KeyboardShortcut>();

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(shortcut: Omit<KeyboardShortcut, 'handler' | 'description'>): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  /**
   * Handle keyboard event
   */
  handleKeyDown = (event: KeyboardEvent): void => {
    for (const shortcut of this.shortcuts.values()) {
      if (this.matchesShortcut(event, shortcut)) {
        event.preventDefault();
        shortcut.handler(event);
        break;
      }
    }
  };

  /**
   * Attach to document
   */
  attach(): void {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Detach from document
   */
  detach(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Get all registered shortcuts
   */
  getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Generate shortcut key
   */
  private getShortcutKey(
    shortcut: Omit<KeyboardShortcut, 'handler' | 'description'>
  ): string {
    const parts = [];
    
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.alt) parts.push('alt');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.meta) parts.push('meta');
    parts.push(shortcut.key.toLowerCase());

    return parts.join('+');
  }

  /**
   * Check if event matches shortcut
   */
  private matchesShortcut(
    event: KeyboardEvent,
    shortcut: KeyboardShortcut
  ): boolean {
    return (
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      event.ctrlKey === !!shortcut.ctrl &&
      event.altKey === !!shortcut.alt &&
      event.shiftKey === !!shortcut.shift &&
      event.metaKey === !!shortcut.meta
    );
  }
}

/**
 * Create keyboard shortcut manager
 */
export function createKeyboardShortcutManager(): KeyboardShortcutManager {
  return new KeyboardShortcutManager();
}

