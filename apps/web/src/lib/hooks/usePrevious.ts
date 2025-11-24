"use client";

import { useRef, useEffect } from "react";

/**
 * Custom hook to get previous value of a variable
 * Useful for comparing current vs previous values
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

