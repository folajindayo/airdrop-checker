/**
 * @fileoverview Tests for WalletConnection component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  WalletConnection,
  WalletType,
  type ConnectionState,
} from '@/components/features/wallet-connection';

describe('WalletConnection', () => {
  // Mock window.ethereum
  beforeEach(() => {
    (window as any).ethereum = {
      isMetaMask: true,
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  afterEach(() => {
    delete (window as any).ethereum;
  });

  describe('Disconnected State', () => {
    it('should render connect button when disconnected', () => {
      render(<WalletConnection />);
      
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('should open wallet list when connect button is clicked', () => {
      render(<WalletConnection />);
      
      const connectButton = screen.getByText('Connect Wallet');
      fireEvent.click(connectButton);
      
      expect(screen.getByText('Connect a Wallet')).toBeInTheDocument();
    });

    it('should display all available wallets', () => {
      render(<WalletConnection />);
      
      fireEvent.click(screen.getByText('Connect Wallet'));
      
      expect(screen.getByText('MetaMask')).toBeInTheDocument();
      expect(screen.getByText('WalletConnect')).toBeInTheDocument();
      expect(screen.getByText('Coinbase Wallet')).toBeInTheDocument();
      expect(screen.getByText('Rainbow')).toBeInTheDocument();
      expect(screen.getByText('Trust Wallet')).toBeInTheDocument();
    });

    it('should close wallet list when overlay is clicked', () => {
      render(<WalletConnection />);
      
      fireEvent.click(screen.getByText('Connect Wallet'));
      expect(screen.getByText('Connect a Wallet')).toBeInTheDocument();
      
      const overlay = screen.getByText('Connect a Wallet').parentElement?.previousSibling;
      if (overlay) {
        fireEvent.click(overlay);
      }
      
      expect(screen.queryByText('Connect a Wallet')).not.toBeInTheDocument();
    });
  });

  describe('Connected State', () => {
    const connectedState: ConnectionState = {
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      wallet: WalletType.METAMASK,
    };

    it('should display formatted address when connected', () => {
      render(<WalletConnection connectionState={connectedState} />);
      
      expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
    });

    it('should display disconnect button when showDisconnect is true', () => {
      render(
        <WalletConnection
          connectionState={connectedState}
          showDisconnect={true}
        />
      );
      
      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });

    it('should not display disconnect button when showDisconnect is false', () => {
      render(
        <WalletConnection
          connectionState={connectedState}
          showDisconnect={false}
        />
      );
      
      expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
    });

    it('should call onDisconnect when disconnect button is clicked', async () => {
      const onDisconnect = jest.fn().mockResolvedValue(undefined);
      
      render(
        <WalletConnection
          connectionState={connectedState}
          onDisconnect={onDisconnect}
        />
      );
      
      fireEvent.click(screen.getByText('Disconnect'));
      
      await waitFor(() => {
        expect(onDisconnect).toHaveBeenCalled();
      });
    });

    it('should display connection indicator', () => {
      render(<WalletConnection connectionState={connectedState} />);
      
      const indicator = screen.getByText('0x1234...7890').previousSibling;
      expect(indicator).toHaveClass('bg-green-500');
    });
  });

  describe('Wallet Connection Flow', () => {
    it('should call onConnect when wallet is selected', async () => {
      const onConnect = jest.fn().mockResolvedValue(undefined);
      
      render(<WalletConnection onConnect={onConnect} />);
      
      fireEvent.click(screen.getByText('Connect Wallet'));
      fireEvent.click(screen.getByText('MetaMask'));
      
      await waitFor(() => {
        expect(onConnect).toHaveBeenCalledWith(WalletType.METAMASK);
      });
    });

    it('should show loading state during connection', async () => {
      const onConnect = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
      
      render(<WalletConnection onConnect={onConnect} />);
      
      fireEvent.click(screen.getByText('Connect Wallet'));
      fireEvent.click(screen.getByText('MetaMask'));
      
      // Check for loading spinner
      const spinner = screen.getByText('MetaMask').parentElement?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      await waitFor(() => {
        expect(onConnect).toHaveBeenCalled();
      });
    });

    it('should close wallet list after successful connection', async () => {
      const onConnect = jest.fn().mockResolvedValue(undefined);
      
      render(<WalletConnection onConnect={onConnect} />);
      
      fireEvent.click(screen.getByText('Connect Wallet'));
      fireEvent.click(screen.getByText('WalletConnect'));
      
      await waitFor(() => {
        expect(screen.queryByText('Connect a Wallet')).not.toBeInTheDocument();
      });
    });

    it('should handle connection errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const onConnect = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      render(<WalletConnection onConnect={onConnect} />);
      
      fireEvent.click(screen.getByText('Connect Wallet'));
      fireEvent.click(screen.getByText('MetaMask'));
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to connect wallet:',
          expect.any(Error)
        );
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Wallet Detection', () => {
    it('should detect installed MetaMask', () => {
      (window as any).ethereum = { isMetaMask: true };
      
      render(<WalletConnection />);
      fireEvent.click(screen.getByText('Connect Wallet'));
      
      const metamask = screen.getByText('MetaMask');
      expect(metamask.parentElement?.textContent).not.toContain('Not installed');
    });

    it('should show install link for non-installed wallets', () => {
      (window as any).ethereum = undefined;
      
      render(<WalletConnection />);
      fireEvent.click(screen.getByText('Connect Wallet'));
      
      const installLinks = screen.getAllByText('Install');
      expect(installLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Event Listeners', () => {
    it('should set up account change listener when connected', () => {
      const ethereum = {
        isMetaMask: true,
        on: jest.fn(),
        removeListener: jest.fn(),
      };
      (window as any).ethereum = ethereum;
      
      const connectedState: ConnectionState = {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
      };
      
      render(<WalletConnection connectionState={connectedState} />);
      
      expect(ethereum.on).toHaveBeenCalledWith(
        'accountsChanged',
        expect.any(Function)
      );
    });

    it('should set up chain change listener when connected', () => {
      const ethereum = {
        isMetaMask: true,
        on: jest.fn(),
        removeListener: jest.fn(),
      };
      (window as any).ethereum = ethereum;
      
      const connectedState: ConnectionState = {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
      };
      
      render(<WalletConnection connectionState={connectedState} />);
      
      expect(ethereum.on).toHaveBeenCalledWith(
        'chainChanged',
        expect.any(Function)
      );
    });

    it('should call onAccountChange when account changes', () => {
      const onAccountChange = jest.fn();
      const ethereum = {
        isMetaMask: true,
        on: jest.fn((event: string, handler: any) => {
          if (event === 'accountsChanged') {
            handler(['0xnewaddress']);
          }
        }),
        removeListener: jest.fn(),
      };
      (window as any).ethereum = ethereum;
      
      const connectedState: ConnectionState = {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
      };
      
      render(
        <WalletConnection
          connectionState={connectedState}
          onAccountChange={onAccountChange}
        />
      );
      
      expect(onAccountChange).toHaveBeenCalledWith('0xnewaddress');
    });

    it('should call onChainChange when chain changes', () => {
      const onChainChange = jest.fn();
      const ethereum = {
        isMetaMask: true,
        on: jest.fn((event: string, handler: any) => {
          if (event === 'chainChanged') {
            handler('0x89'); // Polygon chain ID
          }
        }),
        removeListener: jest.fn(),
      };
      (window as any).ethereum = ethereum;
      
      const connectedState: ConnectionState = {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
      };
      
      render(
        <WalletConnection
          connectionState={connectedState}
          onChainChange={onChainChange}
        />
      );
      
      expect(onChainChange).toHaveBeenCalledWith(137); // Polygon decimal chain ID
    });

    it('should remove listeners on unmount', () => {
      const ethereum = {
        isMetaMask: true,
        on: jest.fn(),
        removeListener: jest.fn(),
      };
      (window as any).ethereum = ethereum;
      
      const connectedState: ConnectionState = {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
      };
      
      const { unmount } = render(
        <WalletConnection connectionState={connectedState} />
      );
      
      unmount();
      
      expect(ethereum.removeListener).toHaveBeenCalledWith(
        'accountsChanged',
        expect.any(Function)
      );
      expect(ethereum.removeListener).toHaveBeenCalledWith(
        'chainChanged',
        expect.any(Function)
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus management', () => {
      render(<WalletConnection />);
      
      const connectButton = screen.getByText('Connect Wallet');
      expect(connectButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('should disable wallet button during connection', async () => {
      const onConnect = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
      
      render(<WalletConnection onConnect={onConnect} />);
      
      fireEvent.click(screen.getByText('Connect Wallet'));
      const metamaskButton = screen.getByText('MetaMask').closest('button');
      
      fireEvent.click(metamaskButton!);
      
      expect(metamaskButton).toBeDisabled();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <WalletConnection className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should show animation for wallet list', () => {
      render(<WalletConnection />);
      
      fireEvent.click(screen.getByText('Connect Wallet'));
      
      const walletList = screen.getByText('Connect a Wallet').parentElement;
      expect(walletList).toHaveClass('animate-in');
    });
  });
});

