/**
 * List virtualization hook
 */

import { useState, useEffect, useCallback, RefObject } from "react";

interface VirtualizationOptions {
  itemHeight: number;
  overscan?: number;
  scrollRef: RefObject<HTMLElement>;
}

interface VirtualizationResult {
  virtualItems: Array<{
    index: number;
    start: number;
    size: number;
  }>;
  totalSize: number;
  scrollToIndex: (index: number) => void;
}

export function useVirtualization(
  itemCount: number,
  options: VirtualizationOptions
): VirtualizationResult {
  const { itemHeight, overscan = 3, scrollRef } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    handleResize();
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollRef]);

  const totalSize = itemCount * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({
      index: i,
      start: i * itemHeight,
      size: itemHeight,
    });
  }

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;

      const offset = index * itemHeight;
      container.scrollTop = offset;
    },
    [scrollRef, itemHeight]
  );

  return {
    virtualItems,
    totalSize,
    scrollToIndex,
  };
}

