/**
 * useClipboard Hook
 * Copy text to clipboard
 */

import { useState } from 'react';

/**
 * Use clipboard for copying text
 * 
 * @returns [copiedText, copy, error]
 * 
 * @example
 * ```tsx
 * const [copiedText, copy, error] = useClipboard();
 * 
 * return (
 *   <button onClick={() => copy('Hello World')}>
 *     {copiedText ? 'Copied!' : 'Copy'}
 *   </button>
 * );
 * ```
 */
export function useClipboard(): [
  string | null,
  (text: string) => Promise<void>,
  Error | null
] {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const copy = async (text: string) => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard not supported'));
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setError(null);

      // Reset copied text after 2 seconds
      setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    } catch (err) {
      setError(err as Error);
      setCopiedText(null);
    }
  };

  return [copiedText, copy, error];
}

