/**
 * @fileoverview Tests for ARIA helpers
 */

import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  useAriaId,
  announce,
  useFocusTrap,
  useRovingTabIndex,
  useReducedMotion,
  useHighContrastMode,
  useAriaExpanded,
  useAriaPressed,
  useAriaSelected,
  isFocusable,
  getFocusableElements,
} from '@/lib/accessibility/aria-helpers';

describe('ARIA Helpers', () => {
  describe('useAriaId', () => {
    it('should generate unique ID', () => {
      const { result: result1 } = renderHook(() => useAriaId('test'));
      const { result: result2 } = renderHook(() => useAriaId('test'));

      expect(result1.current).toMatch(/^test-/);
      expect(result2.current).toMatch(/^test-/);
      expect(result1.current).not.toBe(result2.current);
    });

    it('should use default prefix', () => {
      const { result } = renderHook(() => useAriaId());

      expect(result.current).toMatch(/^aria-/);
    });

    it('should persist ID across renders', () => {
      const { result, rerender } = renderHook(() => useAriaId('test'));

      const firstId = result.current;
      rerender();

      expect(result.current).toBe(firstId);
    });
  });

  describe('announce', () => {
    beforeEach(() => {
      // Clean up live regions
      document.querySelectorAll('[aria-live]').forEach((el) => el.remove());
    });

    it('should create live region', () => {
      announce('Test message', 'polite');

      const liveRegion = document.getElementById('aria-live-polite');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce message', (done) => {
      announce('Test message', 'polite');

      setTimeout(() => {
        const liveRegion = document.getElementById('aria-live-polite');
        expect(liveRegion?.textContent).toBe('Test message');
        done();
      }, 150);
    });

    it('should support assertive priority', () => {
      announce('Urgent message', 'assertive');

      const liveRegion = document.getElementById('aria-live-assertive');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('should be visually hidden', () => {
      announce('Hidden message', 'polite');

      const liveRegion = document.getElementById('aria-live-polite');
      expect(liveRegion?.style.position).toBe('absolute');
      expect(liveRegion?.style.left).toBe('-10000px');
    });
  });

  describe('useFocusTrap', () => {
    it('should create ref', () => {
      const { result } = renderHook(() => useFocusTrap(true));

      expect(result.current).toHaveProperty('current');
    });
  });

  describe('useRovingTabIndex', () => {
    it('should manage current index', () => {
      const items: HTMLElement[] = [];
      const { result } = renderHook(() => useRovingTabIndex(items, 'horizontal'));

      expect(result.current.currentIndex).toBe(0);

      act(() => {
        result.current.setCurrentIndex(2);
      });

      expect(result.current.currentIndex).toBe(2);
    });

    it('should provide keyboard handler', () => {
      const items: HTMLElement[] = [];
      const { result } = renderHook(() => useRovingTabIndex(items, 'horizontal'));

      expect(typeof result.current.handleKeyDown).toBe('function');
    });
  });

  describe('useReducedMotion', () => {
    it('should detect reduced motion preference', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { result } = renderHook(() => useReducedMotion());

      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('useHighContrastMode', () => {
    it('should detect high contrast mode', () => {
      const { result } = renderHook(() => useHighContrastMode());

      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('useAriaExpanded', () => {
    it('should manage expanded state', () => {
      const { result } = renderHook(() => useAriaExpanded(false));

      const [isExpanded, toggle, props] = result.current;

      expect(isExpanded).toBe(false);
      expect(props['aria-expanded']).toBe(false);

      act(() => {
        toggle();
      });

      expect(result.current[0]).toBe(true);
      expect(result.current[2]['aria-expanded']).toBe(true);
    });

    it('should support initial state', () => {
      const { result } = renderHook(() => useAriaExpanded(true));

      expect(result.current[0]).toBe(true);
      expect(result.current[2]['aria-expanded']).toBe(true);
    });
  });

  describe('useAriaPressed', () => {
    it('should manage pressed state', () => {
      const { result } = renderHook(() => useAriaPressed(false));

      const [isPressed, toggle, props] = result.current;

      expect(isPressed).toBe(false);
      expect(props['aria-pressed']).toBe(false);

      act(() => {
        toggle();
      });

      expect(result.current[0]).toBe(true);
      expect(result.current[2]['aria-pressed']).toBe(true);
    });
  });

  describe('useAriaSelected', () => {
    it('should manage selected state', () => {
      const { result } = renderHook(() => useAriaSelected(false));

      const [isSelected, setSelected, props] = result.current;

      expect(isSelected).toBe(false);
      expect(props['aria-selected']).toBe(false);

      act(() => {
        setSelected(true);
      });

      expect(result.current[0]).toBe(true);
      expect(result.current[2]['aria-selected']).toBe(true);
    });
  });

  describe('isFocusable', () => {
    it('should identify focusable buttons', () => {
      const button = document.createElement('button');
      expect(isFocusable(button)).toBe(true);
    });

    it('should identify focusable links', () => {
      const link = document.createElement('a');
      link.href = '#';
      expect(isFocusable(link)).toBe(true);
    });

    it('should identify focusable inputs', () => {
      const input = document.createElement('input');
      expect(isFocusable(input)).toBe(true);
    });

    it('should reject disabled elements', () => {
      const button = document.createElement('button');
      button.disabled = true;
      expect(isFocusable(button)).toBe(false);
    });

    it('should reject tabindex=-1', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '-1');
      expect(isFocusable(div)).toBe(false);
    });

    it('should accept custom tabindex', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      expect(isFocusable(div)).toBe(true);
    });
  });

  describe('getFocusableElements', () => {
    it('should find all focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button</button>
        <a href="#">Link</a>
        <input type="text" />
        <div tabindex="0">Focusable div</div>
        <button disabled>Disabled</button>
      `;

      const focusable = getFocusableElements(container);

      expect(focusable).toHaveLength(4);
    });

    it('should return empty array for empty container', () => {
      const container = document.createElement('div');

      const focusable = getFocusableElements(container);

      expect(focusable).toHaveLength(0);
    });

    it('should exclude disabled elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
      `;

      const focusable = getFocusableElements(container);

      expect(focusable).toHaveLength(1);
    });
  });

  describe('Screen Reader Utilities', () => {
    it('should have sr-only styles', () => {
      const { srOnly } = require('@/lib/accessibility/aria-helpers');

      expect(srOnly.position).toBe('absolute');
      expect(srOnly.width).toBe('1px');
      expect(srOnly.height).toBe('1px');
    });
  });

  describe('Skip Navigation', () => {
    it('should create target ID', () => {
      const { skipNav } = require('@/lib/accessibility/aria-helpers');

      const id = skipNav.createTargetId('main content');
      expect(id).toBe('skip-to-main-content');
    });

    it('should have skip link styles', () => {
      const { skipNav } = require('@/lib/accessibility/aria-helpers');

      expect(skipNav.styles.position).toBe('absolute');
      expect(skipNav.styles.focus).toBeDefined();
    });
  });
});

