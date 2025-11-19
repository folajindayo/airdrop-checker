import { useState, useCallback } from "react";

interface UseClipboardOptions {
  timeout?: number;
}

interface UseClipboardResult {
  copied: boolean;
  error: Error | null;
  copy: (text: string) => Promise<void>;
  reset: () => void;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardResult {
  const { timeout = 2000 } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        setError(new Error("Clipboard API not available"));
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);

        // Reset copied state after timeout
        setTimeout(() => {
          setCopied(false);
        }, timeout);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to copy"));
        setCopied(false);
      }
    },
    [timeout]
  );

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return {
    copied,
    error,
    copy,
    reset,
  };
}

