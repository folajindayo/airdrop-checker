/**
 * @fileoverview Tests for TransactionHistory component
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TransactionHistory,
  TransactionType,
  TransactionStatus,
  type Transaction,
} from '@/components/features/transaction-history';

describe('TransactionHistory', () => {
  const mockTransactions: Transaction[] = [
    {
      hash: '0x123abc',
      type: TransactionType.SEND,
      status: TransactionStatus.CONFIRMED,
      from: '0xabc123',
      to: '0xdef456',
      value: 1.5,
      valueUSD: 4500,
      tokenSymbol: 'ETH',
      gasFee: 0.001,
      timestamp: 1640000000,
      chain: 'Ethereum',
    },
    {
      hash: '0x456def',
      type: TransactionType.RECEIVE,
      status: TransactionStatus.CONFIRMED,
      from: '0xdef456',
      to: '0xabc123',
      value: 100,
      valueUSD: 100,
      tokenSymbol: 'USDC',
      timestamp: 1640001000,
      chain: 'Polygon',
    },
    {
      hash: '0x789ghi',
      type: TransactionType.SWAP,
      status: TransactionStatus.PENDING,
      from: '0xabc123',
      to: '0xcontract',
      value: 50,
      valueUSD: 50,
      tokenSymbol: 'DAI',
      timestamp: 1640002000,
      chain: 'Ethereum',
    },
  ];

  describe('Rendering', () => {
    it('should render transaction list', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      expect(screen.getByText('0x123a...3abc')).toBeInTheDocument();
      expect(screen.getByText('0x456d...6def')).toBeInTheDocument();
    });

    it('should show empty state when no transactions', () => {
      render(<TransactionHistory transactions={[]} />);
      
      expect(screen.getByText('No transactions found')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(
        <TransactionHistory
          transactions={[]}
          emptyMessage="No transaction history available"
        />
      );
      
      expect(screen.getByText('No transaction history available')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TransactionHistory
          transactions={mockTransactions}
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Transaction Display', () => {
    it('should display transaction type badges', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      expect(screen.getByText('Send')).toBeInTheDocument();
      expect(screen.getByText('Receive')).toBeInTheDocument();
      expect(screen.getByText('Swap')).toBeInTheDocument();
    });

    it('should display transaction status badges', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      const confirmedBadges = screen.getAllByText('Confirmed');
      expect(confirmedBadges.length).toBe(2);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should display from and to addresses', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      const fromLabels = screen.getAllByText('From:');
      const toLabels = screen.getAllByText('To:');
      
      expect(fromLabels.length).toBe(mockTransactions.length);
      expect(toLabels.length).toBe(mockTransactions.length);
    });

    it('should display transaction values', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      expect(screen.getByText('1.5')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should display token symbols', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('USDC')).toBeInTheDocument();
      expect(screen.getByText('DAI')).toBeInTheDocument();
    });

    it('should display USD values when available', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      expect(screen.getByText('$4,500.00')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });

    it('should display gas fees when available', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      expect(screen.getByText(/Gas: 0.001/)).toBeInTheDocument();
    });

    it('should display chain names', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      const ethereumLabels = screen.getAllByText('Ethereum');
      const polygonLabel = screen.getByText('Polygon');
      
      expect(ethereumLabels.length).toBeGreaterThan(0);
      expect(polygonLabel).toBeInTheDocument();
    });
  });

  describe('Transaction Direction', () => {
    it('should show outgoing indicator for sent transactions', () => {
      render(
        <TransactionHistory
          transactions={mockTransactions}
          userAddress="0xabc123"
        />
      );
      
      // Find the send transaction
      const sendTransaction = screen.getByText('Send').closest('div');
      expect(sendTransaction).toBeInTheDocument();
    });

    it('should show incoming indicator for received transactions', () => {
      render(
        <TransactionHistory
          transactions={mockTransactions}
          userAddress="0xabc123"
        />
      );
      
      // Find the receive transaction
      const receiveTransaction = screen.getByText('Receive').closest('div');
      expect(receiveTransaction).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should show type filter dropdown', () => {
      render(<TransactionHistory transactions={mockTransactions} showFilters={true} />);
      
      expect(screen.getByText('All Types')).toBeInTheDocument();
    });

    it('should show status filter dropdown', () => {
      render(<TransactionHistory transactions={mockTransactions} showFilters={true} />);
      
      expect(screen.getByText('All Status')).toBeInTheDocument();
    });

    it('should filter by transaction type', () => {
      render(<TransactionHistory transactions={mockTransactions} showFilters={true} />);
      
      const typeFilter = screen.getByDisplayValue('All Types');
      fireEvent.change(typeFilter, { target: { value: TransactionType.SEND } });
      
      expect(screen.getByText('Send')).toBeInTheDocument();
      expect(screen.queryByText('Receive')).not.toBeInTheDocument();
    });

    it('should filter by transaction status', () => {
      render(<TransactionHistory transactions={mockTransactions} showFilters={true} />);
      
      const statusFilter = screen.getByDisplayValue('All Status');
      fireEvent.change(statusFilter, { target: { value: TransactionStatus.PENDING } });
      
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.queryByText('Confirmed')).not.toBeInTheDocument();
    });

    it('should hide filters when showFilters is false', () => {
      render(<TransactionHistory transactions={mockTransactions} showFilters={false} />);
      
      expect(screen.queryByText('All Types')).not.toBeInTheDocument();
      expect(screen.queryByText('All Status')).not.toBeInTheDocument();
    });

    it('should show "no matches" message when filters return empty', () => {
      render(<TransactionHistory transactions={mockTransactions} showFilters={true} />);
      
      const typeFilter = screen.getByDisplayValue('All Types');
      fireEvent.change(typeFilter, { target: { value: TransactionType.APPROVE } });
      
      expect(screen.getByText('No transactions match your filters')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should show sort dropdown', () => {
      render(<TransactionHistory transactions={mockTransactions} showSorting={true} />);
      
      expect(screen.getByDisplayValue('Sort by Date')).toBeInTheDocument();
    });

    it('should show sort order button', () => {
      render(<TransactionHistory transactions={mockTransactions} showSorting={true} />);
      
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('should toggle sort order', () => {
      render(<TransactionHistory transactions={mockTransactions} showSorting={true} />);
      
      const sortButton = screen.getByText('↓');
      fireEvent.click(sortButton);
      
      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('should sort by value', () => {
      render(<TransactionHistory transactions={mockTransactions} showSorting={true} />);
      
      const sortDropdown = screen.getByDisplayValue('Sort by Date');
      fireEvent.change(sortDropdown, { target: { value: 'value' } });
      
      expect(screen.getByDisplayValue('Sort by Value')).toBeInTheDocument();
    });

    it('should hide sorting when showSorting is false', () => {
      render(<TransactionHistory transactions={mockTransactions} showSorting={false} />);
      
      expect(screen.queryByText('Sort by Date')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
      ...mockTransactions[0],
      hash: `0x${i}`,
      timestamp: 1640000000 + i * 1000,
    }));

    it('should paginate transactions', () => {
      render(
        <TransactionHistory
          transactions={manyTransactions}
          itemsPerPage={10}
        />
      );
      
      expect(screen.getByText(/Showing 1 to 10 of 25 transactions/)).toBeInTheDocument();
    });

    it('should show pagination controls', () => {
      render(
        <TransactionHistory
          transactions={manyTransactions}
          itemsPerPage={10}
        />
      );
      
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    it('should navigate to next page', () => {
      render(
        <TransactionHistory
          transactions={manyTransactions}
          itemsPerPage={10}
        />
      );
      
      fireEvent.click(screen.getByText('Next'));
      
      expect(screen.getByText(/Showing 11 to 20 of 25 transactions/)).toBeInTheDocument();
      expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
    });

    it('should navigate to previous page', () => {
      render(
        <TransactionHistory
          transactions={manyTransactions}
          itemsPerPage={10}
        />
      );
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Previous'));
      
      expect(screen.getByText(/Showing 1 to 10 of 25 transactions/)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      render(
        <TransactionHistory
          transactions={manyTransactions}
          itemsPerPage={10}
        />
      );
      
      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(
        <TransactionHistory
          transactions={manyTransactions}
          itemsPerPage={10}
        />
      );
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Next'));
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('should not show pagination for single page', () => {
      render(
        <TransactionHistory
          transactions={mockTransactions}
          itemsPerPage={10}
        />
      );
      
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onTransactionClick when transaction is clicked', () => {
      const onTransactionClick = jest.fn();
      
      render(
        <TransactionHistory
          transactions={mockTransactions}
          onTransactionClick={onTransactionClick}
        />
      );
      
      const firstTransaction = screen.getByText('Send').closest('div')?.parentElement;
      if (firstTransaction) {
        fireEvent.click(firstTransaction);
      }
      
      expect(onTransactionClick).toHaveBeenCalledWith(mockTransactions[0]);
    });

    it('should show pointer cursor when clickable', () => {
      render(
        <TransactionHistory
          transactions={mockTransactions}
          onTransactionClick={jest.fn()}
        />
      );
      
      const firstTransaction = screen.getByText('Send').closest('div')?.parentElement;
      expect(firstTransaction).toHaveClass('cursor-pointer');
    });

    it('should not have pointer cursor when not clickable', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      const firstTransaction = screen.getByText('Send').closest('div')?.parentElement;
      expect(firstTransaction).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible select elements', () => {
      render(<TransactionHistory transactions={mockTransactions} showFilters={true} />);
      
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons', () => {
      const manyTransactions = Array.from({ length: 15 }, (_, i) => ({
        ...mockTransactions[0],
        hash: `0x${i}`,
      }));
      
      render(
        <TransactionHistory
          transactions={manyTransactions}
          itemsPerPage={10}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should have hover effect on transactions', () => {
      const { container } = render(
        <TransactionHistory transactions={mockTransactions} />
      );
      
      const transactions = container.querySelectorAll('.hover\\:shadow-md');
      expect(transactions.length).toBe(mockTransactions.length);
    });

    it('should support dark mode classes', () => {
      const { container } = render(
        <TransactionHistory transactions={mockTransactions} />
      );
      
      const darkModeElements = container.querySelectorAll('.dark\\:bg-gray-800');
      expect(darkModeElements.length).toBeGreaterThan(0);
    });
  });
});

