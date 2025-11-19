/**
 * useCopyToClipboard Hook
 * Copy text to clipboard with feedback
 */

import { useState, useCallback } from "react";

interface CopyState {
  value: string | null;
  success: boolean;
}

export function useCopyToClipboard(): [
  CopyState,
  (text: string) => Promise<void>
] {
  const [state, setState] = useState<CopyState>({
    value: null,
    success: false,
  });

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState({ value: text, success: true });

      // Reset success after 2 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, success: false }));
      }, 2000);
    } catch (error) {
      setState({ value: null, success: false });
      console.error("Failed to copy to clipboard:", error);
    }
  }, []);

  return [state, copy];
}

