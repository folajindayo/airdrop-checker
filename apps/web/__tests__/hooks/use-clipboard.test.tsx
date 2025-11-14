/**
 * @fileoverview Comprehensive tests for useClipboard hook
 * Tests copying text to clipboard with various scenarios
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useClipboard } from '@/lib/hooks/use-clipboard';

describe('useClipboard', () => {
  // Mock clipboard API
  let writeTextMock: jest.Mock;

  beforeEach(() => {
    writeTextMock = jest.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should copy text to clipboard', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('Hello, World!');
      });

      expect(writeTextMock).toHaveBeenCalledWith('Hello, World!');
      expect(result.current.copied).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should reset copied state after timeout', async () => {
      const { result } = renderHook(() => useClipboard({ timeout: 2000 }));

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.copied).toBe(false);
    });

    it('should handle copy errors', async () => {
      const error = new Error('Clipboard access denied');
      writeTextMock.mockRejectedValue(error);

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBe(error);
    });
  });

  describe('Custom Timeout', () => {
    it('should use default timeout of 2000ms', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1999);
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current.copied).toBe(false);
    });

    it('should respect custom timeout', async () => {
      const { result } = renderHook(() => useClipboard({ timeout: 5000 }));

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.copied).toBe(false);
    });

    it('should handle zero timeout', async () => {
      const { result } = renderHook(() => useClipboard({ timeout: 0 }));

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current.copied).toBe(false);
    });
  });

  describe('Multiple Copies', () => {
    it('should handle multiple copy operations', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('First');
      });

      expect(writeTextMock).toHaveBeenCalledWith('First');
      expect(result.current.copied).toBe(true);

      await act(async () => {
        await result.current.copy('Second');
      });

      expect(writeTextMock).toHaveBeenCalledWith('Second');
      expect(result.current.copied).toBe(true);
    });

    it('should reset timeout on new copy', async () => {
      const { result } = renderHook(() => useClipboard({ timeout: 2000 }));

      await act(async () => {
        await result.current.copy('First');
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.copied).toBe(true);

      await act(async () => {
        await result.current.copy('Second');
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.copied).toBe(false);
    });
  });

  describe('Reset Function', () => {
    it('should provide reset function', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should clear timeout on manual reset', async () => {
      const { result } = renderHook(() => useClipboard({ timeout: 2000 }));

      await act(async () => {
        await result.current.copy('Test');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.copied).toBe(false);

      // Advancing time should not affect state after manual reset
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.copied).toBe(false);
    });

    it('should clear error on reset', async () => {
      const error = new Error('Copy failed');
      writeTextMock.mockRejectedValue(error);

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.error).toBe(error);

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Different Text Types', () => {
    it('should copy empty string', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('');
      });

      expect(writeTextMock).toHaveBeenCalledWith('');
      expect(result.current.copied).toBe(true);
    });

    it('should copy numbers as strings', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('123');
      });

      expect(writeTextMock).toHaveBeenCalledWith('123');
      expect(result.current.copied).toBe(true);
    });

    it('should copy multiline text', async () => {
      const { result } = renderHook(() => useClipboard());

      const multilineText = 'Line 1\nLine 2\nLine 3';

      await act(async () => {
        await result.current.copy(multilineText);
      });

      expect(writeTextMock).toHaveBeenCalledWith(multilineText);
      expect(result.current.copied).toBe(true);
    });

    it('should copy text with special characters', async () => {
      const { result } = renderHook(() => useClipboard());

      const specialText = '!@#$%^&*()_+{}:"<>?[];,./\\';

      await act(async () => {
        await result.current.copy(specialText);
      });

      expect(writeTextMock).toHaveBeenCalledWith(specialText);
      expect(result.current.copied).toBe(true);
    });

    it('should copy very long text', async () => {
      const { result } = renderHook(() => useClipboard());

      const longText = 'x'.repeat(10000);

      await act(async () => {
        await result.current.copy(longText);
      });

      expect(writeTextMock).toHaveBeenCalledWith(longText);
      expect(result.current.copied).toBe(true);
    });

    it('should copy Unicode text', async () => {
      const { result } = renderHook(() => useClipboard());

      const unicodeText = '你好世界 🌍 مرحبا العالم';

      await act(async () => {
        await result.current.copy(unicodeText);
      });

      expect(writeTextMock).toHaveBeenCalledWith(unicodeText);
      expect(result.current.copied).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on unmount', async () => {
      const { result, unmount } = renderHook(() =>
        useClipboard({ timeout: 2000 })
      );

      await act(async () => {
        await result.current.copy('Test');
      });

      unmount();

      // Should not cause errors
      act(() => {
        jest.advanceTimersByTime(2000);
      });
    });

    it('should cleanup previous timeout on new copy', async () => {
      const { result } = renderHook(() => useClipboard({ timeout: 2000 }));

      await act(async () => {
        await result.current.copy('First');
      });

      await act(async () => {
        await result.current.copy('Second');
      });

      // Only one timeout should be active
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.copied).toBe(false);
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle missing clipboard API', async () => {
      const originalClipboard = navigator.clipboard;
      // @ts-ignore
      delete navigator.clipboard;

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBeTruthy();

      navigator.clipboard = originalClipboard;
    });

    it('should handle clipboard API without writeText', async () => {
      Object.assign(navigator, {
        clipboard: {},
      });

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('Test');
      });

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive copies', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await Promise.all([
          result.current.copy('Test1'),
          result.current.copy('Test2'),
          result.current.copy('Test3'),
        ]);
      });

      expect(writeTextMock).toHaveBeenCalledTimes(3);
      expect(result.current.copied).toBe(true);
    });

    it('should handle copy during previous copy', async () => {
      let resolveFirst: () => void;
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve;
      });

      writeTextMock
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useClipboard());

      act(() => {
        result.current.copy('First');
        result.current.copy('Second');
      });

      await act(async () => {
        resolveFirst!();
        await Promise.resolve();
      });

      expect(writeTextMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should work for copying code snippets', async () => {
      const { result } = renderHook(() => useClipboard());

      const codeSnippet = `function hello() {
  console.log('Hello, World!');
}`;

      await act(async () => {
        await result.current.copy(codeSnippet);
      });

      expect(writeTextMock).toHaveBeenCalledWith(codeSnippet);
      expect(result.current.copied).toBe(true);
    });

    it('should work for copying wallet addresses', async () => {
      const { result } = renderHook(() => useClipboard());

      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';

      await act(async () => {
        await result.current.copy(walletAddress);
      });

      expect(writeTextMock).toHaveBeenCalledWith(walletAddress);
      expect(result.current.copied).toBe(true);
    });

    it('should work for copying URLs', async () => {
      const { result } = renderHook(() => useClipboard());

      const url = 'https://example.com/path?query=value#hash';

      await act(async () => {
        await result.current.copy(url);
      });

      expect(writeTextMock).toHaveBeenCalledWith(url);
      expect(result.current.copied).toBe(true);
    });

    it('should work for copying JSON', async () => {
      const { result } = renderHook(() => useClipboard());

      const json = JSON.stringify({ key: 'value', nested: { data: 123 } }, null, 2);

      await act(async () => {
        await result.current.copy(json);
      });

      expect(writeTextMock).toHaveBeenCalledWith(json);
      expect(result.current.copied).toBe(true);
    });
  });
});

