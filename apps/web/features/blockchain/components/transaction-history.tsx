/**
 * @fileoverview Transaction history component
 * 
 * Displays a list of transactions with filtering and sorting
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatNumber, formatCurrency, formatAddress, formatDate } from '@/lib/utils/format';

/**
 * Transaction type
 */
export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  SWAP = 'swap',
  APPROVE = 'approve',
  CONTRACT = 'contract',
}

/**
 * Transaction status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

/**
 * Transaction data
 */
export interface Transaction {
  /** Transaction hash */
  hash: string;
  /** Transaction type */
  type: TransactionType;
  /** Transaction status */
  status: TransactionStatus;
  /** From address */
  from: string;
  /** To address */
  to: string;
  /** Value in native currency */
  value: string | number;
  /** Value in USD */
  valueUSD?: number;
  /** Token symbol */
  tokenSymbol?: string;
  /** Gas fee */
  gasFee?: string | number;
  /** Gas fee in USD */
  gasFeeUSD?: number;
  /** Block number */
  blockNumber?: number;
  /** Timestamp */
  timestamp: number;
  /** Blockchain network */
  chain?: string;
}

/**
 * Transaction history props
 */
export interface TransactionHistoryProps {
  /** List of transactions */
  transactions: Transaction[];
  /** Current user address */
  userAddress?: string;
  /** Show filters */
  showFilters?: boolean;
  /** Show sorting */
  showSorting?: boolean;
  /** Items per page */
  itemsPerPage?: number;
  /** On transaction click callback */
  onTransactionClick?: (transaction: Transaction) => void;
  /** Custom class name */
  className?: string;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * Transaction type badge
 */
function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const config = {
    [TransactionType.SEND]: { label: 'Send', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    [TransactionType.RECEIVE]: { label: 'Receive', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    [TransactionType.SWAP]: { label: 'Swap', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    [TransactionType.APPROVE]: { label: 'Approve', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    [TransactionType.CONTRACT]: { label: 'Contract', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
  };

  const { label, color } = config[type];

  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', color)}>
      {label}
    </span>
  );
}

/**
 * Transaction status badge
 */
function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const config = {
    [TransactionStatus.PENDING]: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      icon: '⏳',
    },
    [TransactionStatus.CONFIRMED]: {
      label: 'Confirmed',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      icon: '✓',
    },
    [TransactionStatus.FAILED]: {
      label: 'Failed',
      color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      icon: '✗',
    },
  };

  const { label, color, icon } = config[status];

  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1', color)}>
      <span>{icon}</span>
      {label}
    </span>
  );
}

/**
 * Transaction history component
 */
export function TransactionHistory({
  transactions,
  userAddress,
  showFilters = true,
  showSorting = true,
  itemsPerPage = 10,
  onTransactionClick,
  className,
  emptyMessage = 'No transactions found',
}: TransactionHistoryProps) {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = a.timestamp - b.timestamp;
      } else if (sortBy === 'value') {
        comparison = Number(a.value) - Number(b.value);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, typeFilter, statusFilter, sortBy, sortOrder]);

  // Paginate transactions
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get transaction direction
  const getTransactionDirection = (transaction: Transaction) => {
    if (!userAddress) return null;

    const normalizedUser = userAddress.toLowerCase();
    const normalizedFrom = transaction.from.toLowerCase();
    const normalizedTo = transaction.to.toLowerCase();

    if (normalizedFrom === normalizedUser) return 'out';
    if (normalizedTo === normalizedUser) return 'in';
    return null;
  };

  if (transactions.length === 0) {
    return (
      <div
        className={cn(
          'p-8 text-center',
          'bg-gray-50 dark:bg-gray-900',
          'rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700',
          className
        )}
      >
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters and Sorting */}
      {(showFilters || showSorting) && (
        <div className="flex flex-wrap gap-3">
          {showFilters && (
            <>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-300 dark:border-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                <option value="all">All Types</option>
                <option value={TransactionType.SEND}>Send</option>
                <option value={TransactionType.RECEIVE}>Receive</option>
                <option value={TransactionType.SWAP}>Swap</option>
                <option value={TransactionType.APPROVE}>Approve</option>
                <option value={TransactionType.CONTRACT}>Contract</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'all')}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-300 dark:border-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                <option value="all">All Status</option>
                <option value={TransactionStatus.PENDING}>Pending</option>
                <option value={TransactionStatus.CONFIRMED}>Confirmed</option>
                <option value={TransactionStatus.FAILED}>Failed</option>
              </select>
            </>
          )}

          {showSorting && (
            <>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'value')}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-300 dark:border-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                <option value="date">Sort by Date</option>
                <option value="value">Sort by Value</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg',
                  'bg-gray-100 dark:bg-gray-700',
                  'hover:bg-gray-200 dark:hover:bg-gray-600',
                  'transition-colors'
                )}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Transactions List */}
      {paginatedTransactions.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No transactions match your filters
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedTransactions.map((transaction) => {
            const direction = getTransactionDirection(transaction);

            return (
              <div
                key={transaction.hash}
                onClick={() => onTransactionClick?.(transaction)}
                className={cn(
                  'p-4 rounded-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'hover:shadow-md transition-shadow',
                  onTransactionClick && 'cursor-pointer'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <TransactionTypeBadge type={transaction.type} />
                      <TransactionStatusBadge status={transaction.status} />
                      {transaction.chain && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.chain}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">From:</span>
                        <code className="text-gray-900 dark:text-white">
                          {formatAddress(transaction.from)}
                        </code>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">To:</span>
                        <code className="text-gray-900 dark:text-white">
                          {formatAddress(transaction.to)}
                        </code>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(new Date(transaction.timestamp * 1000), 'PPpp')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {direction === 'out' && (
                        <span className="text-red-600 dark:text-red-400">-</span>
                      )}
                      {direction === 'in' && (
                        <span className="text-green-600 dark:text-green-400">+</span>
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatNumber(Number(transaction.value), 4)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {transaction.tokenSymbol || 'ETH'}
                      </span>
                    </div>

                    {transaction.valueUSD !== undefined && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(transaction.valueUSD)}
                      </div>
                    )}

                    {transaction.gasFee && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Gas: {formatNumber(Number(transaction.gasFee), 6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} transactions
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                'px-3 py-1 text-sm rounded-lg',
                'bg-gray-100 dark:bg-gray-700',
                'hover:bg-gray-200 dark:hover:bg-gray-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Previous
            </button>

            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                'px-3 py-1 text-sm rounded-lg',
                'bg-gray-100 dark:bg-gray-700',
                'hover:bg-gray-200 dark:hover:bg-gray-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <TransactionHistory
 *   transactions={[
 *     {
 *       hash: '0x123...',
 *       type: TransactionType.SEND,
 *       status: TransactionStatus.CONFIRMED,
 *       from: '0xabc...',
 *       to: '0xdef...',
 *       value: 1.5,
 *       valueUSD: 4500,
 *       timestamp: 1234567890,
 *     },
 *   ]}
 *   userAddress="0xabc..."
 *   onTransactionClick={(tx) => console.log('Clicked:', tx)}
 * />
 */

