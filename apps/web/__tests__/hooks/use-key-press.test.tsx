/**
 * @fileoverview Comprehensive tests for useKeyPress hook
 * Tests keyboard event detection for various keys and combinations
 */

import { renderHook, act } from '@testing-library/react';
import { useKeyPress } from '@/lib/hooks/use-key-press';

describe('useKeyPress', () => {
  describe('Basic Functionality', () => {
    it('should return false initially', () => {
      const { result } = renderHook(() => useKeyPress('Enter'));
      expect(result.current).toBe(false);
    });

    it('should return true when key is pressed', () => {
      const { result } = renderHook(() => useKeyPress('Enter'));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event);
      });

      expect(result.current).toBe(true);
    });

    it('should return false when key is released', () => {
      const { result } = renderHook(() => useKeyPress('Enter'));

      act(() => {
        const downEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(downEvent);
      });

      expect(result.current).toBe(true);

      act(() => {
        const upEvent = new KeyboardEvent('keyup', { key: 'Enter' });
        window.dispatchEvent(upEvent);
      });

      expect(result.current).toBe(false);
    });

    it('should not trigger for different keys', () => {
      const { result } = renderHook(() => useKeyPress('Enter'));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(event);
      });

      expect(result.current).toBe(false);
    });
  });

  describe('Different Keys', () => {
    it('should detect letter keys', () => {
      const { result } = renderHook(() => useKeyPress('a'));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'a' });
        window.dispatchEvent(event);
      });

      expect(result.current).toBe(true);
    });

    it('should detect number keys', () => {
      const { result } = renderHook(() => useKeyPress('1'));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        window.dispatchEvent(event);
      });

      expect(result.current).toBe(true);
    });

    it('should detect special keys', () => {
      const keys = ['Escape', 'Enter', 'Tab', 'Backspace', 'Delete'];

      keys.forEach((key) => {
        const { result } = renderHook(() => useKeyPress(key));

        act(() => {
          const event = new KeyboardEvent('keydown', { key });
          window.dispatchEvent(event);
        });

        expect(result.current).toBe(true);
      });
    });

    it('should detect arrow keys', () => {
      const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

      arrows.forEach((key) => {
        const { result } = renderHook(() => useKeyPress(key));

        act(() => {
          const event = new KeyboardEvent('keydown', { key });
          window.dispatchEvent(event);
        });

        expect(result.current).toBe(true);
      });
    });

    it('should detect modifier keys', () => {
      const modifiers = ['Control', 'Alt', 'Shift', 'Meta'];

      modifiers.forEach((key) => {
        const { result } = renderHook(() => useKeyPress(key));

        act(() => {
          const event = new KeyboardEvent('keydown', { key });
          window.dispatchEvent(event);
        });

        expect(result.current).toBe(true);
      });
    });

    it('should detect function keys', () => {
      const { result } = renderHook(() => useKeyPress('F1'));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'F1' });
        window.dispatchEvent(event);
      });

      expect(result.current).toBe(true);
    });

    it('should detect space key', () => {
      const { result } = renderHook(() => useKeyPress(' '));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(event);
      });

      expect(result.current).toBe(true);
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case sensitive for letter keys', () => {
      const { result: lowerResult } = renderHook(() => useKeyPress('a'));
      const { result: upperResult } = renderHook(() => useKeyPress('A'));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'a' });
        window.dispatchEvent(event);
      });

      expect(lowerResult.current).toBe(true);
      expect(upperResult.current).toBe(false);
    });

    it('should handle uppercase letters', () => {
      const { result } = renderHook(() => useKeyPress('A'));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'A' });
        window.dispatchEvent(event);
      });

      expect(result.current).toBe(true);
    });
  });

  describe('Multiple Key Presses', () => {
    it('should handle rapid key presses', () => {
      const { result } = renderHook(() => useKeyPress('a'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
      });

      expect(result.current).toBe(false); // Should be false after final keyup
    });

    it('should handle multiple keys pressed simultaneously', () => {
      const { result: aResult } = renderHook(() => useKeyPress('a'));
      const { result: bResult } = renderHook(() => useKeyPress('b'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
      });

      expect(aResult.current).toBe(true);
      expect(bResult.current).toBe(true);
    });

    it('should track key state independently', () => {
      const { result: aResult } = renderHook(() => useKeyPress('a'));
      const { result: bResult } = renderHook(() => useKeyPress('b'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      });

      expect(aResult.current).toBe(true);
      expect(bResult.current).toBe(false);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
      });

      expect(aResult.current).toBe(false);
      expect(bResult.current).toBe(true);
    });
  });

  describe('Target Element', () => {
    it('should listen on window by default', () => {
      const { result } = renderHook(() => useKeyPress('Enter'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      expect(result.current).toBe(true);
    });

    it('should listen on custom target element', () => {
      const element = document.createElement('div');
      const ref = { current: element };

      const { result } = renderHook(() => useKeyPress('Enter', ref));

      act(() => {
        element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      expect(result.current).toBe(true);
    });

    it('should not trigger when key pressed on different element', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      const ref = { current: element1 };

      const { result } = renderHook(() => useKeyPress('Enter', ref));

      act(() => {
        element2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: false }));
      });

      expect(result.current).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const { result, unmount } = renderHook(() => useKeyPress('Enter'));

      unmount();

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      // State should not update after unmount
      expect(result.current).toBe(false);
    });

    it('should cleanup listeners when key changes', () => {
      const { result, rerender } = renderHook(
        ({ key }) => useKeyPress(key),
        { initialProps: { key: 'a' } }
      );

      rerender({ key: 'b' });

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      });

      // Should not respond to old key
      expect(result.current).toBe(false);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
      });

      // Should respond to new key
      expect(result.current).toBe(true);
    });

    it('should cleanup listeners when target changes', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      const ref = { current: element1 };

      const { result, rerender } = renderHook(() =>
        useKeyPress('Enter', ref)
      );

      ref.current = element2;
      rerender();

      act(() => {
        element1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      // Should not respond to old target
      expect(result.current).toBe(false);

      act(() => {
        element2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      // Should respond to new target
      expect(result.current).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null target ref', () => {
      const ref = { current: null };

      const { result } = renderHook(() => useKeyPress('Enter', ref));

      // Should listen on window when ref is null
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      expect(result.current).toBe(true);
    });

    it('should handle undefined target', () => {
      const { result } = renderHook(() => useKeyPress('Enter', undefined));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      expect(result.current).toBe(true);
    });

    it('should handle empty string key', () => {
      const { result } = renderHook(() => useKeyPress(''));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '' }));
      });

      expect(result.current).toBe(true);
    });

    it('should handle key press without corresponding key up', () => {
      const { result } = renderHook(() => useKeyPress('a'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      });

      expect(result.current).toBe(true);

      // Unmount without keyup
      // State should remain true
    });
  });

  describe('Real-World Scenarios', () => {
    it('should work for Enter key submit', () => {
      const { result } = renderHook(() => useKeyPress('Enter'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      expect(result.current).toBe(true);
    });

    it('should work for Escape key to close modal', () => {
      const { result } = renderHook(() => useKeyPress('Escape'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(result.current).toBe(true);
    });

    it('should work for arrow keys navigation', () => {
      const { result: upResult } = renderHook(() => useKeyPress('ArrowUp'));
      const { result: downResult } = renderHook(() => useKeyPress('ArrowDown'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });

      expect(upResult.current).toBe(true);
      expect(downResult.current).toBe(false);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      });

      expect(upResult.current).toBe(false);
      expect(downResult.current).toBe(true);
    });

    it('should work for keyboard shortcuts', () => {
      const { result } = renderHook(() => useKeyPress('s'));

      // Simulate Ctrl+S
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
        );
      });

      expect(result.current).toBe(true);
    });

    it('should work for game controls', () => {
      const { result: wResult } = renderHook(() => useKeyPress('w'));
      const { result: aResult } = renderHook(() => useKeyPress('a'));
      const { result: sResult } = renderHook(() => useKeyPress('s'));
      const { result: dResult } = renderHook(() => useKeyPress('d'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
      });

      expect(wResult.current).toBe(true);
      expect(aResult.current).toBe(false);
      expect(sResult.current).toBe(false);
      expect(dResult.current).toBe(true);
    });

    it('should work for accessibility keyboard navigation', () => {
      const { result: tabResult } = renderHook(() => useKeyPress('Tab'));
      const { result: enterResult } = renderHook(() => useKeyPress('Enter'));
      const { result: spaceResult } = renderHook(() => useKeyPress(' '));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      });

      expect(tabResult.current).toBe(true);
      expect(enterResult.current).toBe(false);
      expect(spaceResult.current).toBe(false);
    });

    it('should work for input focus management', () => {
      const { result } = renderHook(() => useKeyPress('/'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      });

      expect(result.current).toBe(true);
    });

    it('should work for command palette trigger', () => {
      const { result } = renderHook(() => useKeyPress('k'));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'k', metaKey: true })
        );
      });

      expect(result.current).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should not add multiple listeners on re-render', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      const { rerender } = renderHook(() => useKeyPress('Enter'));

      const initialCallCount = addEventListenerSpy.mock.calls.length;

      rerender();
      rerender();
      rerender();

      // Should not add more listeners
      expect(addEventListenerSpy.mock.calls.length).toBe(initialCallCount);

      addEventListenerSpy.mockRestore();
    });

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useKeyPress('a'));

      act(() => {
        for (let i = 0; i < 100; i++) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
        }
      });

      expect(result.current).toBe(false);
    });
  });

  describe('Multiple Instances', () => {
    it('should work with multiple independent hooks', () => {
      const { result: result1 } = renderHook(() => useKeyPress('a'));
      const { result: result2 } = renderHook(() => useKeyPress('b'));
      const { result: result3 } = renderHook(() => useKeyPress('c'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
      });

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(false);
      expect(result3.current).toBe(true);
    });

    it('should work with same key in multiple hooks', () => {
      const { result: result1 } = renderHook(() => useKeyPress('Enter'));
      const { result: result2 } = renderHook(() => useKeyPress('Enter'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
    });
  });
});

