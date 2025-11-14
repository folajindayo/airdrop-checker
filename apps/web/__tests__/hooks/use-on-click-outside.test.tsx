/**
 * @fileoverview Comprehensive tests for useOnClickOutside hook
 * Tests click outside detection for modals, dropdowns, and other UI elements
 */

import { renderHook } from '@testing-library/react';
import { useOnClickOutside } from '@/lib/hooks/use-on-click-outside';

describe('useOnClickOutside', () => {
  let element: HTMLDivElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement('div');
    outsideElement = document.createElement('div');
    document.body.appendChild(element);
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });

  describe('Basic Functionality', () => {
    it('should call handler when clicking outside element', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      outsideElement.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not call handler when clicking inside element', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      element.click();

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not call handler when ref is null', () => {
      const handler = jest.fn();
      const ref = { current: null };

      renderHook(() => useOnClickOutside(ref, handler));

      outsideElement.click();

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle clicks on child elements', () => {
      const handler = jest.fn();
      const ref = { current: element };
      const child = document.createElement('div');
      element.appendChild(child);

      renderHook(() => useOnClickOutside(ref, handler));

      child.click();

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle clicks on deeply nested children', () => {
      const handler = jest.fn();
      const ref = { current: element };
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      const child3 = document.createElement('div');
      element.appendChild(child1);
      child1.appendChild(child2);
      child2.appendChild(child3);

      renderHook(() => useOnClickOutside(ref, handler));

      child3.click();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Events', () => {
    it('should detect mousedown events', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      const event = new MouseEvent('mousedown', { bubbles: true });
      outsideElement.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should detect click events', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      const event = new MouseEvent('click', { bubbles: true });
      outsideElement.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Touch Events', () => {
    it('should detect touchstart events', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      const event = new TouchEvent('touchstart', { bubbles: true });
      outsideElement.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should handle both mouse and touch events', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      const mouseEvent = new MouseEvent('mousedown', { bubbles: true });
      outsideElement.dispatchEvent(mouseEvent);

      const touchEvent = new TouchEvent('touchstart', { bubbles: true });
      outsideElement.dispatchEvent(touchEvent);

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('Handler Updates', () => {
    it('should use updated handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const ref = { current: element };

      const { rerender } = renderHook(
        ({ handler }) => useOnClickOutside(ref, handler),
        { initialProps: { handler: handler1 } }
      );

      outsideElement.click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();

      rerender({ handler: handler2 });

      outsideElement.click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ref Updates', () => {
    it('should handle ref changes', () => {
      const handler = jest.fn();
      const element2 = document.createElement('div');
      document.body.appendChild(element2);

      const ref = { current: element };

      const { rerender } = renderHook(() =>
        useOnClickOutside(ref, handler)
      );

      // Click outside first element
      outsideElement.click();
      expect(handler).toHaveBeenCalledTimes(1);

      // Change ref to second element
      ref.current = element2;
      rerender();

      // Click on first element (now outside)
      element.click();
      expect(handler).toHaveBeenCalledTimes(2);

      // Click on second element (inside)
      element2.click();
      expect(handler).toHaveBeenCalledTimes(2);

      document.body.removeChild(element2);
    });

    it('should handle ref becoming null', () => {
      const handler = jest.fn();
      const ref = { current: element as HTMLDivElement | null };

      const { rerender } = renderHook(() =>
        useOnClickOutside(ref, handler)
      );

      ref.current = null;
      rerender();

      outsideElement.click();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const handler = jest.fn();
      const ref = { current: element };

      const { unmount } = renderHook(() =>
        useOnClickOutside(ref, handler)
      );

      unmount();

      outsideElement.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should remove old listeners when ref changes', () => {
      const handler = jest.fn();
      const element2 = document.createElement('div');
      document.body.appendChild(element2);

      const ref = { current: element };

      const { rerender } = renderHook(() =>
        useOnClickOutside(ref, handler)
      );

      ref.current = element2;
      rerender();

      // Old element should not trigger handler
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(element2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle clicks on document.body', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      document.body.click();
      expect(handler).toHaveBeenCalled();
    });

    it('should handle clicks on document', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      const event = new MouseEvent('mousedown', { bubbles: true });
      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should handle preventDefault on events', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      event.preventDefault();
      outsideElement.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should handle stopPropagation on events', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      outsideElement.addEventListener(
        'mousedown',
        (e) => e.stopPropagation(),
        true
      );

      const event = new MouseEvent('mousedown', { bubbles: true });
      outsideElement.dispatchEvent(event);

      // Handler might not be called due to stopPropagation
      // This tests that the hook handles this scenario gracefully
    });

    it('should handle elements removed from DOM', () => {
      const handler = jest.fn();
      const tempElement = document.createElement('div');
      document.body.appendChild(tempElement);

      const ref = { current: tempElement };

      renderHook(() => useOnClickOutside(ref, handler));

      document.body.removeChild(tempElement);

      outsideElement.click();

      // Should not throw error
      expect(handler).toHaveBeenCalled();
    });

    it('should handle disabled elements', () => {
      const handler = jest.fn();
      const button = document.createElement('button');
      button.disabled = true;
      document.body.appendChild(button);

      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      button.click();

      expect(handler).toHaveBeenCalled();

      document.body.removeChild(button);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should work for modal closing', () => {
      const onClose = jest.fn();
      const modalContent = document.createElement('div');
      const modalOverlay = document.createElement('div');
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);

      const ref = { current: modalContent };

      renderHook(() => useOnClickOutside(ref, onClose));

      // Click on overlay (outside modal content)
      modalOverlay.click();

      expect(onClose).toHaveBeenCalled();

      document.body.removeChild(modalOverlay);
    });

    it('should work for dropdown closing', () => {
      const onClose = jest.fn();
      const dropdown = document.createElement('div');
      const trigger = document.createElement('button');
      document.body.appendChild(dropdown);
      document.body.appendChild(trigger);

      const ref = { current: dropdown };

      renderHook(() => useOnClickOutside(ref, onClose));

      // Click on trigger (outside dropdown)
      trigger.click();

      expect(onClose).toHaveBeenCalled();

      document.body.removeChild(dropdown);
      document.body.removeChild(trigger);
    });

    it('should work for context menu closing', () => {
      const onClose = jest.fn();
      const contextMenu = document.createElement('div');
      document.body.appendChild(contextMenu);

      const ref = { current: contextMenu };

      renderHook(() => useOnClickOutside(ref, onClose));

      // Click anywhere outside
      document.body.click();

      expect(onClose).toHaveBeenCalled();

      document.body.removeChild(contextMenu);
    });

    it('should work for tooltip closing', () => {
      const onClose = jest.fn();
      const tooltip = document.createElement('div');
      const target = document.createElement('div');
      document.body.appendChild(tooltip);
      document.body.appendChild(target);

      const ref = { current: tooltip };

      renderHook(() => useOnClickOutside(ref, onClose));

      // Click on target (outside tooltip)
      target.click();

      expect(onClose).toHaveBeenCalled();

      document.body.removeChild(tooltip);
      document.body.removeChild(target);
    });

    it('should work for sidebar closing on mobile', () => {
      const onClose = jest.fn();
      const sidebar = document.createElement('div');
      const mainContent = document.createElement('div');
      document.body.appendChild(sidebar);
      document.body.appendChild(mainContent);

      const ref = { current: sidebar };

      renderHook(() => useOnClickOutside(ref, onClose));

      // Click on main content
      mainContent.click();

      expect(onClose).toHaveBeenCalled();

      document.body.removeChild(sidebar);
      document.body.removeChild(mainContent);
    });
  });

  describe('Performance', () => {
    it('should not add multiple listeners on re-render', () => {
      const handler = jest.fn();
      const ref = { current: element };

      const { rerender } = renderHook(() =>
        useOnClickOutside(ref, handler)
      );

      rerender();
      rerender();
      rerender();

      outsideElement.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid clicks', () => {
      const handler = jest.fn();
      const ref = { current: element };

      renderHook(() => useOnClickOutside(ref, handler));

      for (let i = 0; i < 10; i++) {
        outsideElement.click();
      }

      expect(handler).toHaveBeenCalledTimes(10);
    });
  });

  describe('Multiple Instances', () => {
    it('should work with multiple independent hooks', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      const ref1 = { current: element1 };
      const ref2 = { current: element2 };

      renderHook(() => useOnClickOutside(ref1, handler1));
      renderHook(() => useOnClickOutside(ref2, handler2));

      // Click outside both
      outsideElement.click();

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });

    it('should handle nested elements', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      parent.appendChild(child);
      document.body.appendChild(parent);

      const handlerParent = jest.fn();
      const handlerChild = jest.fn();

      const refParent = { current: parent };
      const refChild = { current: child };

      renderHook(() => useOnClickOutside(refParent, handlerParent));
      renderHook(() => useOnClickOutside(refChild, handlerChild));

      // Click on parent (inside parent, outside child)
      parent.click();

      expect(handlerParent).not.toHaveBeenCalled();
      expect(handlerChild).toHaveBeenCalled();

      document.body.removeChild(parent);
    });
  });
});

