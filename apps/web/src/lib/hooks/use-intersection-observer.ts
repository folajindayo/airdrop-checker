/**
 * useIntersectionObserver Hook
 * Detects when an element is visible in the viewport
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Whether the observer should run only once */
  once?: boolean;
  /** Callback when intersection changes */
  onIntersect?: (entry: IntersectionObserverEntry) => void;
}

/**
 * Use Intersection Observer API
 * 
 * @param options - Observer options
 * @returns [ref, isIntersecting, entry]
 * 
 * @example
 * ```tsx
 * const [ref, isIntersecting] = useIntersectionObserver({
 *   threshold: 0.5,
 *   once: true,
 * });
 * 
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <Component />}
 *   </div>
 * );
 * ```
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const { once = false, onIntersect, ...observerOptions } = options;
  
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);

        // Call callback
        if (entry.isIntersecting) {
          onIntersect?.(entry);
        }

        // Disconnect if once is true and element is intersecting
        if (once && entry.isIntersecting) {
          observer.disconnect();
        }
      },
      observerOptions
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once, onIntersect, observerOptions.root, observerOptions.rootMargin, observerOptions.threshold]);

  return [ref, isIntersecting, entry];
}

/**
 * Simplified lazy loading hook
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>() {
  return useIntersectionObserver<T>({
    once: true,
    rootMargin: '100px',
  });
}

