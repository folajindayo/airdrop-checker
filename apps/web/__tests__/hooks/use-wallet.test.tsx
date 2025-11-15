/**
 * @fileoverview Tests for useWallet hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet, WalletType } from '@/lib/hooks/use-wallet';

describe('useWallet', () => {
  let mockEthereum: any;

  beforeEach(() => {
    // Mock ethereum provider
    mockEthereum = {
      isMetaMask: true,
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };

    (window as any).ethereum = mockEthereum;

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    delete (window as any).ethereum;
  });

  describe('Initial State', () => {
    it('should start with disconnected state', () => {
      const { result } = renderHook(() => useWallet());

      expect(result.current.state.isConnected).toBe(false);
      expect(result.current.state.isConnecting).toBe(false);
      expect(result.current.state.address).toBeUndefined();
      expect(result.current.state.chainId).toBeUndefined();
    });
  });

  describe('Connect Wallet', () => {
    it('should connect to MetaMask successfully', async () => {
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890']) // eth_requestAccounts
        .mockResolvedValueOnce('0x1') // eth_chainId
        .mockResolvedValueOnce('0xde0b6b3a7640000'); // eth_getBalance (1 ETH)

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      expect(result.current.state.isConnected).toBe(true);
      expect(result.current.state.address).toBe('0x1234567890123456789012345678901234567890');
      expect(result.current.state.chainId).toBe(1);
      expect(result.current.state.balance).toBe('1');
      expect(result.current.state.walletType).toBe(WalletType.METAMASK);
    });

    it('should set connecting state during connection', async () => {
      mockEthereum.request.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useWallet());

      act(() => {
        result.current.connect(WalletType.METAMASK);
      });

      expect(result.current.state.isConnecting).toBe(true);

      await waitFor(() => {
        expect(result.current.state.isConnecting).toBe(false);
      });
    });

    it('should handle connection error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockEthereum.request.mockRejectedValueOnce(new Error('User rejected'));

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      expect(result.current.state.isConnected).toBe(false);
      expect(result.current.state.error).toBe('User rejected');

      consoleError.mockRestore();
    });

    it('should handle no accounts error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockEthereum.request.mockResolvedValueOnce([]); // No accounts

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      expect(result.current.state.isConnected).toBe(false);
      expect(result.current.state.error).toBe('No accounts found');

      consoleError.mockRestore();
    });

    it('should store connection in localStorage', async () => {
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      expect(localStorage.getItem('wallet_type')).toBe(WalletType.METAMASK);
      expect(localStorage.getItem('wallet_address')).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('Disconnect Wallet', () => {
    it('should disconnect wallet successfully', async () => {
      // First connect
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      // Then disconnect
      await act(async () => {
        await result.current.disconnect();
      });

      expect(result.current.state.isConnected).toBe(false);
      expect(result.current.state.address).toBeUndefined();
      expect(result.current.state.chainId).toBeUndefined();
      expect(result.current.state.balance).toBeUndefined();
    });

    it('should clear localStorage on disconnect', async () => {
      // First connect
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      await act(async () => {
        await result.current.disconnect();
      });

      expect(localStorage.getItem('wallet_type')).toBeNull();
      expect(localStorage.getItem('wallet_address')).toBeNull();
    });
  });

  describe('Switch Chain', () => {
    beforeEach(async () => {
      // Connect first
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000');
    });

    it('should switch chain successfully', async () => {
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000')
        .mockResolvedValueOnce(null); // wallet_switchEthereumChain

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      await act(async () => {
        await result.current.switchChain(137); // Polygon
      });

      expect(result.current.state.chainId).toBe(137);
    });

    it('should add chain if not present', async () => {
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000')
        .mockRejectedValueOnce({ code: 4902 }) // Chain not added
        .mockResolvedValueOnce(null); // wallet_addEthereumChain

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      await act(async () => {
        await result.current.switchChain(137);
      });

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: expect.any(Array),
      });
    });

    it('should handle switch chain error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000')
        .mockRejectedValueOnce(new Error('User rejected'));

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.switchChain(137);
        });
      }).rejects.toThrow();

      consoleError.mockRestore();
    });
  });

  describe('Refresh Balance', () => {
    it('should refresh balance successfully', async () => {
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000') // 1 ETH
        .mockResolvedValueOnce('0x1bc16d674ec80000'); // 2 ETH

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      expect(result.current.state.balance).toBe('1');

      await act(async () => {
        await result.current.refreshBalance();
      });

      expect(result.current.state.balance).toBe('2');
    });

    it('should handle refresh balance error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000')
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      await act(async () => {
        await result.current.refreshBalance();
      });

      // Balance should remain unchanged on error
      expect(result.current.state.balance).toBe('1');

      consoleError.mockRestore();
    });
  });

  describe('Sign Message', () => {
    it('should sign message successfully', async () => {
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000')
        .mockResolvedValueOnce('0xsignature');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      let signature: string | undefined;

      await act(async () => {
        signature = await result.current.signMessage('Hello World');
      });

      expect(signature).toBe('0xsignature');
    });

    it('should throw error when not connected', async () => {
      const { result } = renderHook(() => useWallet());

      await expect(async () => {
        await act(async () => {
          await result.current.signMessage('Hello World');
        });
      }).rejects.toThrow('Wallet not connected');
    });

    it('should handle sign message error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000')
        .mockRejectedValueOnce(new Error('User rejected'));

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.signMessage('Hello World');
        });
      }).rejects.toThrow();

      consoleError.mockRestore();
    });
  });

  describe('Event Listeners', () => {
    it('should set up event listeners when connected', async () => {
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('should remove event listeners on unmount', async () => {
      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000');

      const { result, unmount } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect(WalletType.METAMASK);
      });

      unmount();

      expect(mockEthereum.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('Auto-connect', () => {
    it('should auto-connect when wallet type is stored', async () => {
      localStorage.setItem('wallet_type', WalletType.METAMASK);
      localStorage.setItem('wallet_address', '0x1234567890123456789012345678901234567890');

      mockEthereum.request
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890'])
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0xde0b6b3a7640000');

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.state.isConnected).toBe(true);
      });
    });

    it('should clear localStorage on auto-connect failure', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      localStorage.setItem('wallet_type', WalletType.METAMASK);
      localStorage.setItem('wallet_address', '0x1234567890123456789012345678901234567890');

      mockEthereum.request.mockRejectedValueOnce(new Error('Connection failed'));

      renderHook(() => useWallet());

      await waitFor(() => {
        expect(localStorage.getItem('wallet_type')).toBeNull();
        expect(localStorage.getItem('wallet_address')).toBeNull();
      });

      consoleError.mockRestore();
    });
  });
});

