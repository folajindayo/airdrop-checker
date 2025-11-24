/**
 * useOnClickOutside Hook
 * Detects clicks outside of an element
 */

import { useEffect, RefObject } from 'react';

/**
 * Detect clicks outside of an element
 * 
 * @param ref - Element ref
 * @param handler - Callback when clicked outside
 * @param enabled - Whether the handler is enabled
 * 
 * @example
 * ```tsx
 * const ref = useRef(null);
 * useOnClickOutside(ref, () => setIsOpen(false));
 * 
 * return <div ref={ref}>Menu</div>;
 * ```
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

