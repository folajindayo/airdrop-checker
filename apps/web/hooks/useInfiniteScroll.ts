import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollResult {
  sentryRef: React.RefObject<HTMLDivElement>;
  isIntersecting: boolean;
}

export function useInfiniteScroll(
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult {
  const {
    threshold = 0.5,
    rootMargin = "0px",
    enabled = true,
  } = options;

  const sentryRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isIntersectingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && enabled) {
        isIntersectingRef.current = true;
        onLoadMore();
      } else {
        isIntersectingRef.current = false;
      }
    },
    [onLoadMore, enabled]
  );

  useEffect(() => {
    if (!sentryRef.current) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    // Start observing
    observerRef.current.observe(sentryRef.current);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  // Disable observer when not enabled
  useEffect(() => {
    if (!enabled && observerRef.current && sentryRef.current) {
      observerRef.current.unobserve(sentryRef.current);
    } else if (enabled && observerRef.current && sentryRef.current) {
      observerRef.current.observe(sentryRef.current);
    }
  }, [enabled]);

  return {
    sentryRef,
    isIntersecting: isIntersectingRef.current,
  };
}

