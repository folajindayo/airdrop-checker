/**
 * useWalletBalance Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useWalletBalance } from '../../lib/hooks/useWalletBalance';

global.fetch = jest.fn();

describe('useWalletBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches balance when address provided', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ native: '1.5', tokens: [], totalValue: 1.5 }),
    });

    const { result } = renderHook(() =>
      useWalletBalance('0x123', 1)
    );

    await waitFor(() => {
      expect(result.current.balance).toBeTruthy();
    });

    expect(result.current.balance?.native).toBe('1.5');
  });

  it('handles undefined address', () => {
    const { result } = renderHook(() =>
      useWalletBalance(undefined, 1)
    );

    expect(result.current.balance).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

