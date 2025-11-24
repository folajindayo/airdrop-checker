"use client";

import { useState, useCallback } from "react";

/**
 * Custom hook for boolean toggle state
 * Provides toggle, on, and off functions
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const on = useCallback(() => {
    setValue(true);
  }, []);

  const off = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, on, off];
}

