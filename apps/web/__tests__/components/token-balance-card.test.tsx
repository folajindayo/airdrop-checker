/**
 * @fileoverview Tests for TokenBalanceCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TokenBalanceCard,
  TokenBalanceList,
  type TokenBalance,
} from '@/components/features/token-balance-card';

describe('TokenBalanceCard', () => {
  const mockToken: TokenBalance = {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 1.5,
    balanceUSD: 4500,
    priceUSD: 3000,
    change24h: 5.2,
    chain: 'Ethereum',
    contractAddress: '0x0000000000000000000000000000000000000000',
  };

  describe('Rendering', () => {
    it('should render token information', () => {
      render(<TokenBalanceCard token={mockToken} />);
      
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });

    it('should render token balance', () => {
      render(<TokenBalanceCard token={mockToken} />);
      
      expect(screen.getByText('1.5')).toBeInTheDocument();
    });

    it('should render balance in USD when available', () => {
      render(<TokenBalanceCard token={mockToken} />);
      
      expect(screen.getByText('$4,500.00')).toBeInTheDocument();
    });

    it('should render chain name', () => {
      render(<TokenBalanceCard token={mockToken} />);
      
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });

    it('should render token icon with initials as fallback', () => {
      const { container } = render(<TokenBalanceCard token={mockToken} />);
      
      const icon = container.querySelector('.bg-gradient-to-br');
      expect(icon).toHaveTextContent('ET');
    });

    it('should render token icon from URL when provided', () => {
      const tokenWithIcon = { ...mockToken, iconUrl: 'https://example.com/eth.png' };
      const { container } = render(<TokenBalanceCard token={tokenWithIcon} />);
      
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', 'https://example.com/eth.png');
      expect(img).toHaveAttribute('alt', 'ETH');
    });
  });

  describe('Price Display', () => {
    it('should show price when showPrice is true', () => {
      render(<TokenBalanceCard token={mockToken} showPrice={true} />);
      
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });

    it('should hide price when showPrice is false', () => {
      render(<TokenBalanceCard token={mockToken} showPrice={false} />);
      
      expect(screen.queryByText('Price')).not.toBeInTheDocument();
    });

    it('should not show price section when priceUSD is undefined', () => {
      const tokenWithoutPrice = { ...mockToken, priceUSD: undefined };
      render(<TokenBalanceCard token={tokenWithoutPrice} />);
      
      expect(screen.queryByText('Price')).not.toBeInTheDocument();
    });
  });

  describe('Change Display', () => {
    it('should show positive change with green color', () => {
      render(<TokenBalanceCard token={mockToken} showChange={true} />);
      
      const changeElement = screen.getByText(/5.20%/);
      expect(changeElement).toHaveClass('text-green-600');
    });

    it('should show negative change with red color', () => {
      const tokenWithNegativeChange = { ...mockToken, change24h: -3.5 };
      render(<TokenBalanceCard token={tokenWithNegativeChange} showChange={true} />);
      
      const changeElement = screen.getByText(/3.50%/);
      expect(changeElement).toHaveClass('text-red-600');
    });

    it('should show up arrow for positive change', () => {
      const { container } = render(<TokenBalanceCard token={mockToken} showChange={true} />);
      
      const upArrow = container.querySelector('path[fill-rule="evenodd"]');
      expect(upArrow).toBeInTheDocument();
    });

    it('should show down arrow for negative change', () => {
      const tokenWithNegativeChange = { ...mockToken, change24h: -3.5 };
      const { container } = render(<TokenBalanceCard token={tokenWithNegativeChange} showChange={true} />);
      
      const downArrow = container.querySelector('path[fill-rule="evenodd"]');
      expect(downArrow).toBeInTheDocument();
    });

    it('should hide change when showChange is false', () => {
      render(<TokenBalanceCard token={mockToken} showChange={false} />);
      
      expect(screen.queryByText('24h Change')).not.toBeInTheDocument();
    });

    it('should not show change section when change24h is undefined', () => {
      const tokenWithoutChange = { ...mockToken, change24h: undefined };
      render(<TokenBalanceCard token={tokenWithoutChange} />);
      
      expect(screen.queryByText('24h Change')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should show action buttons when showActions is true', () => {
      render(
        <TokenBalanceCard
          token={mockToken}
          showActions={true}
          onSend={jest.fn()}
          onReceive={jest.fn()}
          onSwap={jest.fn()}
        />
      );
      
      expect(screen.getByText('Send')).toBeInTheDocument();
      expect(screen.getByText('Receive')).toBeInTheDocument();
      expect(screen.getByText('Swap')).toBeInTheDocument();
    });

    it('should hide action buttons when showActions is false', () => {
      render(<TokenBalanceCard token={mockToken} showActions={false} />);
      
      expect(screen.queryByText('Send')).not.toBeInTheDocument();
      expect(screen.queryByText('Receive')).not.toBeInTheDocument();
      expect(screen.queryByText('Swap')).not.toBeInTheDocument();
    });

    it('should call onSend when Send button is clicked', () => {
      const onSend = jest.fn();
      render(<TokenBalanceCard token={mockToken} onSend={onSend} />);
      
      fireEvent.click(screen.getByText('Send'));
      expect(onSend).toHaveBeenCalledWith(mockToken);
    });

    it('should call onReceive when Receive button is clicked', () => {
      const onReceive = jest.fn();
      render(<TokenBalanceCard token={mockToken} onReceive={onReceive} />);
      
      fireEvent.click(screen.getByText('Receive'));
      expect(onReceive).toHaveBeenCalledWith(mockToken);
    });

    it('should call onSwap when Swap button is clicked', () => {
      const onSwap = jest.fn();
      render(<TokenBalanceCard token={mockToken} onSwap={onSwap} />);
      
      fireEvent.click(screen.getByText('Swap'));
      expect(onSwap).toHaveBeenCalledWith(mockToken);
    });

    it('should only show buttons for provided callbacks', () => {
      render(
        <TokenBalanceCard
          token={mockToken}
          onSend={jest.fn()}
        />
      );
      
      expect(screen.getByText('Send')).toBeInTheDocument();
      expect(screen.queryByText('Receive')).not.toBeInTheDocument();
      expect(screen.queryByText('Swap')).not.toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode', () => {
      const { container } = render(
        <TokenBalanceCard token={mockToken} compact={true} />
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('p-3');
    });

    it('should have smaller icon in compact mode', () => {
      const { container } = render(
        <TokenBalanceCard token={mockToken} compact={true} />
      );
      
      const icon = container.querySelector('.w-10');
      expect(icon).toBeInTheDocument();
    });

    it('should hide chain name in compact mode', () => {
      render(<TokenBalanceCard token={mockToken} compact={true} />);
      
      const chainBadges = screen.queryAllByText('Ethereum');
      // Should only have the name, not the chain badge
      expect(chainBadges.length).toBe(1);
    });

    it('should hide price and change sections in compact mode', () => {
      render(<TokenBalanceCard token={mockToken} compact={true} />);
      
      expect(screen.queryByText('Price')).not.toBeInTheDocument();
      expect(screen.queryByText('24h Change')).not.toBeInTheDocument();
    });

    it('should hide actions in compact mode', () => {
      render(
        <TokenBalanceCard
          token={mockToken}
          compact={true}
          onSend={jest.fn()}
        />
      );
      
      expect(screen.queryByText('Send')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <TokenBalanceCard token={mockToken} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have hover effect', () => {
      const { container } = render(<TokenBalanceCard token={mockToken} />);
      
      expect(container.firstChild).toHaveClass('hover:shadow-md');
    });

    it('should support dark mode classes', () => {
      const { container } = render(<TokenBalanceCard token={mockToken} />);
      
      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
    });
  });
});

describe('TokenBalanceList', () => {
  const mockTokens: TokenBalance[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 1.5,
      balanceUSD: 4500,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 1000,
      balanceUSD: 1000,
    },
    {
      symbol: 'DAI',
      name: 'Dai',
      balance: 500,
      balanceUSD: 500,
    },
  ];

  describe('Rendering', () => {
    it('should render all tokens', () => {
      render(<TokenBalanceList tokens={mockTokens} />);
      
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('USDC')).toBeInTheDocument();
      expect(screen.getByText('DAI')).toBeInTheDocument();
    });

    it('should show empty state when no tokens', () => {
      render(<TokenBalanceList tokens={[]} />);
      
      expect(screen.getByText('No tokens found')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(
        <TokenBalanceList
          tokens={[]}
          emptyMessage="Your wallet is empty"
        />
      );
      
      expect(screen.getByText('Your wallet is empty')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TokenBalanceList tokens={mockTokens} className="custom-list" />
      );
      
      expect(container.firstChild).toHaveClass('custom-list');
    });
  });

  describe('Card Props', () => {
    it('should pass props to all cards', () => {
      render(
        <TokenBalanceList
          tokens={mockTokens}
          cardProps={{ compact: true, showActions: false }}
        />
      );
      
      // Verify compact mode by checking for smaller padding
      const cards = document.querySelectorAll('.p-3');
      expect(cards.length).toBe(mockTokens.length);
    });

    it('should pass callbacks to all cards', () => {
      const onSend = jest.fn();
      render(
        <TokenBalanceList
          tokens={mockTokens}
          cardProps={{ onSend }}
        />
      );
      
      const sendButtons = screen.getAllByText('Send');
      fireEvent.click(sendButtons[0]);
      
      expect(onSend).toHaveBeenCalledWith(mockTokens[0]);
    });
  });

  describe('Layout', () => {
    it('should have proper spacing between cards', () => {
      const { container } = render(<TokenBalanceList tokens={mockTokens} />);
      
      expect(container.firstChild).toHaveClass('space-y-3');
    });

    it('should have dashed border for empty state', () => {
      const { container } = render(<TokenBalanceList tokens={[]} />);
      
      expect(container.firstChild).toHaveClass('border-dashed');
    });
  });
});

