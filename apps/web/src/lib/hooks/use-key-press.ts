/**
 * useKeyPress Hook
 * Detects when a key is pressed
 */

import { useState, useEffect } from 'react';

/**
 * Detect key press
 * 
 * @param targetKey - Key to detect (e.g., 'Escape', 'Enter')
 * @param options - Options
 * @returns Boolean indicating if key is pressed
 * 
 * @example
 * ```tsx
 * const escapePressed = useKeyPress('Escape');
 * const enterPressed = useKeyPress('Enter');
 * 
 * useEffect(() => {
 *   if (escapePressed) {
 *     closeModal();
 *   }
 * }, [escapePressed]);
 * ```
 */
export function useKeyPress(
  targetKey: string,
  options: {
    onPress?: () => void;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  } = {}
): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      // Check if the pressed key matches
      if (event.key !== targetKey) return;

      // Check modifier keys if specified
      if (options.ctrlKey !== undefined && event.ctrlKey !== options.ctrlKey) return;
      if (options.shiftKey !== undefined && event.shiftKey !== options.shiftKey) return;
      if (options.altKey !== undefined && event.altKey !== options.altKey) return;
      if (options.metaKey !== undefined && event.metaKey !== options.metaKey) return;

      setKeyPressed(true);
      options.onPress?.();
    };

    const upHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey, options.ctrlKey, options.shiftKey, options.altKey, options.metaKey, options.onPress]);

  return keyPressed;
}

/**
 * Common keyboard shortcut hooks
 */
export function useEscapeKey(callback: () => void) {
  return useKeyPress('Escape', { onPress: callback });
}

export function useEnterKey(callback: () => void) {
  return useKeyPress('Enter', { onPress: callback });
}

export function useCommandK(callback: () => void) {
  return useKeyPress('k', { onPress: callback, metaKey: true });
}

