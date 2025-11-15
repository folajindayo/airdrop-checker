/**
 * @fileoverview Tests for NetworkSwitcher component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  NetworkSwitcher,
  type NetworkInfo,
} from '@/components/features/network-switcher';

describe('NetworkSwitcher', () => {
  const mockNetworks: NetworkInfo[] = [
    {
      id: 1,
      name: 'Ethereum Mainnet',
      shortName: 'Ethereum',
      chainId: '0x1',
      currency: 'ETH',
      rpcUrl: 'https://mainnet.infura.io/v3/',
      explorerUrl: 'https://etherscan.io',
      icon: '⟠',
      testnet: false,
    },
    {
      id: 137,
      name: 'Polygon Mainnet',
      shortName: 'Polygon',
      chainId: '0x89',
      currency: 'MATIC',
      rpcUrl: 'https://polygon-rpc.com',
      explorerUrl: 'https://polygonscan.com',
      icon: '⬡',
      testnet: false,
    },
    {
      id: 11155111,
      name: 'Sepolia Testnet',
      shortName: 'Sepolia',
      chainId: '0xaa36a7',
      currency: 'ETH',
      rpcUrl: 'https://sepolia.infura.io/v3/',
      explorerUrl: 'https://sepolia.etherscan.io',
      icon: '⟠',
      testnet: true,
    },
  ];

  describe('Rendering', () => {
    it('should render network switcher button', () => {
      render(<NetworkSwitcher />);
      
      expect(screen.getByRole('button', { name: /switch network/i })).toBeInTheDocument();
    });

    it('should show "Select Network" when no network is selected', () => {
      render(<NetworkSwitcher />);
      
      expect(screen.getByText('Select Network')).toBeInTheDocument();
    });

    it('should display current network name when selected', () => {
      render(
        <NetworkSwitcher
          currentNetwork={mockNetworks[0]}
          networks={mockNetworks}
        />
      );
      
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });

    it('should display current network icon when available', () => {
      render(
        <NetworkSwitcher
          currentNetwork={mockNetworks[0]}
          networks={mockNetworks}
        />
      );
      
      expect(screen.getByText('⟠')).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when button is clicked', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      expect(screen.getByText('Select Network')).toBeInTheDocument();
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
      expect(screen.getByText('Polygon')).toBeInTheDocument();
    });

    it('should close dropdown when button is clicked again', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      const button = screen.getByRole('button', { name: /switch network/i });
      fireEvent.click(button);
      expect(screen.getByText('Polygon')).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(screen.queryByText('Polygon')).not.toBeInTheDocument();
    });

    it('should have correct aria attributes', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      const button = screen.getByRole('button', { name: /switch network/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should rotate chevron icon when dropdown is open', () => {
      const { container } = render(<NetworkSwitcher networks={mockNetworks} />);
      
      const button = screen.getByRole('button', { name: /switch network/i });
      const chevron = button.querySelector('svg');
      
      expect(chevron).not.toHaveClass('rotate-180');
      
      fireEvent.click(button);
      expect(chevron).toHaveClass('rotate-180');
    });
  });

  describe('Network Selection', () => {
    it('should call onNetworkChange when network is selected', async () => {
      const onNetworkChange = jest.fn().mockResolvedValue(undefined);
      
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          onNetworkChange={onNetworkChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      fireEvent.click(screen.getByText('Ethereum'));
      
      await waitFor(() => {
        expect(onNetworkChange).toHaveBeenCalledWith(mockNetworks[0]);
      });
    });

    it('should show loading state during network switch', async () => {
      const onNetworkChange = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
      
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          onNetworkChange={onNetworkChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      fireEvent.click(screen.getByText('Ethereum'));
      
      // Check for loading spinner
      const spinner = screen.getByText('Ethereum').parentElement?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      await waitFor(() => {
        expect(onNetworkChange).toHaveBeenCalled();
      });
    });

    it('should close dropdown after successful network switch', async () => {
      const onNetworkChange = jest.fn().mockResolvedValue(undefined);
      
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          onNetworkChange={onNetworkChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      fireEvent.click(screen.getByText('Polygon'));
      
      await waitFor(() => {
        expect(screen.queryByText('Polygon')).not.toBeInTheDocument();
      });
    });

    it('should handle network switch errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const onNetworkChange = jest.fn().mockRejectedValue(new Error('Switch failed'));
      
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          onNetworkChange={onNetworkChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      fireEvent.click(screen.getByText('Ethereum'));
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to switch network:',
          expect.any(Error)
        );
      });
      
      consoleError.mockRestore();
    });

    it('should not call onNetworkChange when selecting current network', () => {
      const onNetworkChange = jest.fn();
      
      render(
        <NetworkSwitcher
          currentNetwork={mockNetworks[0]}
          networks={mockNetworks}
          onNetworkChange={onNetworkChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      fireEvent.click(screen.getByText('Ethereum'));
      
      expect(onNetworkChange).not.toHaveBeenCalled();
    });
  });

  describe('Network Filtering', () => {
    it('should hide testnet networks by default', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      expect(screen.queryByText('Sepolia')).not.toBeInTheDocument();
    });

    it('should show testnet networks when showTestnets is true', () => {
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          showTestnets={true}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      expect(screen.getByText('Sepolia')).toBeInTheDocument();
    });

    it('should display testnet badge for testnet networks', () => {
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          showTestnets={true}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      const sepoliaButton = screen.getByText('Sepolia').closest('button');
      expect(sepoliaButton).toHaveTextContent('Testnet');
    });

    it('should show testnet disclaimer when testnets are enabled', () => {
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          showTestnets={true}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      expect(screen.getByText(/Testnet networks are for development only/i)).toBeInTheDocument();
    });

    it('should show empty state when no networks are available', () => {
      render(
        <NetworkSwitcher
          networks={mockNetworks.filter(n => n.testnet)}
          showTestnets={false}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      expect(screen.getByText('No networks available')).toBeInTheDocument();
    });
  });

  describe('Network Display', () => {
    it('should display network icon and name', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      const ethereumButton = screen.getByText('Ethereum').closest('button');
      expect(ethereumButton).toHaveTextContent('⟠');
      expect(ethereumButton).toHaveTextContent('Ethereum');
    });

    it('should display network currency', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('MATIC')).toBeInTheDocument();
    });

    it('should highlight selected network', () => {
      render(
        <NetworkSwitcher
          currentNetwork={mockNetworks[0]}
          networks={mockNetworks}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      const ethereumButton = screen.getByText('Ethereum').closest('button');
      expect(ethereumButton).toHaveClass('bg-blue-50');
    });

    it('should show checkmark for selected network', () => {
      render(
        <NetworkSwitcher
          currentNetwork={mockNetworks[0]}
          networks={mockNetworks}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      const ethereumButton = screen.getByText('Ethereum').closest('button');
      const checkmark = ethereumButton?.querySelector('path[fill-rule="evenodd"]');
      expect(checkmark).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should not open dropdown when disabled', () => {
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          disabled={true}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      expect(screen.queryByText('Polygon')).not.toBeInTheDocument();
    });

    it('should have disabled styling', () => {
      render(
        <NetworkSwitcher
          networks={mockNetworks}
          disabled={true}
        />
      );
      
      const button = screen.getByRole('button', { name: /switch network/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus management', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      const button = screen.getByRole('button', { name: /switch network/i });
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('should support keyboard navigation', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      const button = screen.getByRole('button', { name: /switch network/i });
      button.focus();
      
      expect(button).toHaveFocus();
    });

    it('should have accessible network buttons', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      const networkButtons = screen.getAllByRole('button');
      expect(networkButtons.length).toBeGreaterThan(1);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <NetworkSwitcher
          networks={mockNetworks}
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should show animation for dropdown', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /switch network/i }));
      
      const dropdown = screen.getByText('Select Network').parentElement;
      expect(dropdown).toHaveClass('animate-in');
    });

    it('should support dark mode classes', () => {
      render(<NetworkSwitcher networks={mockNetworks} />);
      
      const button = screen.getByRole('button', { name: /switch network/i });
      expect(button).toHaveClass('dark:bg-gray-800');
    });
  });
});

