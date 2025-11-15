/**
 * @fileoverview Token balance card component
 * 
 * Displays token balance information with price, change, and actions
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formatNumber, formatCurrency } from '@/lib/utils/format';

/**
 * Token balance data
 */
export interface TokenBalance {
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Balance amount */
  balance: string | number;
  /** Balance in USD */
  balanceUSD?: number;
  /** Current price in USD */
  priceUSD?: number;
  /** 24h price change percentage */
  change24h?: number;
  /** Token icon URL */
  iconUrl?: string;
  /** Blockchain network */
  chain?: string;
  /** Contract address */
  contractAddress?: string;
}

/**
 * Token balance card props
 */
export interface TokenBalanceCardProps {
  /** Token balance data */
  token: TokenBalance;
  /** Show price information */
  showPrice?: boolean;
  /** Show 24h change */
  showChange?: boolean;
  /** Show actions */
  showActions?: boolean;
  /** On send callback */
  onSend?: (token: TokenBalance) => void;
  /** On receive callback */
  onReceive?: (token: TokenBalance) => void;
  /** On swap callback */
  onSwap?: (token: TokenBalance) => void;
  /** Custom class name */
  className?: string;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Token icon component
 */
function TokenIcon({
  symbol,
  iconUrl,
  className,
}: {
  symbol: string;
  iconUrl?: string;
  className?: string;
}) {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={symbol}
        className={cn('rounded-full', className)}
        onError={(e) => {
          // Fallback to initials on error
          e.currentTarget.style.display = 'none';
          if (e.currentTarget.nextSibling) {
            (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-blue-500 to-purple-600',
        'flex items-center justify-center text-white font-bold',
        className
      )}
    >
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  );
}

/**
 * Token balance card component
 */
export function TokenBalanceCard({
  token,
  showPrice = true,
  showChange = true,
  showActions = true,
  onSend,
  onReceive,
  onSwap,
  className,
  compact = false,
}: TokenBalanceCardProps) {
  const changeIsPositive = (token.change24h ?? 0) >= 0;

  return (
    <div
      className={cn(
        'p-4 rounded-lg',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'hover:shadow-md transition-shadow',
        compact && 'p-3',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Token Icon */}
        <TokenIcon
          symbol={token.symbol}
          iconUrl={token.iconUrl}
          className={compact ? 'w-10 h-10' : 'w-12 h-12'}
        />

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'font-semibold text-gray-900 dark:text-white truncate',
                  compact ? 'text-sm' : 'text-base'
                )}
              >
                {token.symbol}
              </h3>
              <p
                className={cn(
                  'text-gray-500 dark:text-gray-400 truncate',
                  compact ? 'text-xs' : 'text-sm'
                )}
              >
                {token.name}
              </p>
              {token.chain && !compact && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {token.chain}
                </span>
              )}
            </div>

            {/* Balance Amount */}
            <div className="text-right">
              <p
                className={cn(
                  'font-semibold text-gray-900 dark:text-white',
                  compact ? 'text-sm' : 'text-lg'
                )}
              >
                {formatNumber(Number(token.balance), 4)}
              </p>
              {showPrice && token.balanceUSD !== undefined && (
                <p
                  className={cn(
                    'text-gray-500 dark:text-gray-400',
                    compact ? 'text-xs' : 'text-sm'
                  )}
                >
                  {formatCurrency(token.balanceUSD)}
                </p>
              )}
            </div>
          </div>

          {/* Price and Change */}
          {!compact && showPrice && (token.priceUSD !== undefined || token.change24h !== undefined) && (
            <div className="mt-3 flex items-center gap-3">
              {token.priceUSD !== undefined && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(token.priceUSD)}
                  </p>
                </div>
              )}

              {showChange && token.change24h !== undefined && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">24h Change</p>
                  <p
                    className={cn(
                      'text-sm font-medium flex items-center gap-1',
                      changeIsPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {changeIsPositive ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {Math.abs(token.change24h).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {!compact && showActions && (
            <div className="mt-3 flex gap-2">
              {onSend && (
                <button
                  onClick={() => onSend(token)}
                  className={cn(
                    'flex-1 px-3 py-1.5 text-sm font-medium rounded-lg',
                    'bg-blue-600 text-white hover:bg-blue-700',
                    'transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  Send
                </button>
              )}

              {onReceive && (
                <button
                  onClick={() => onReceive(token)}
                  className={cn(
                    'flex-1 px-3 py-1.5 text-sm font-medium rounded-lg',
                    'bg-gray-100 text-gray-900 hover:bg-gray-200',
                    'dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
                    'transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                  )}
                >
                  Receive
                </button>
              )}

              {onSwap && (
                <button
                  onClick={() => onSwap(token)}
                  className={cn(
                    'flex-1 px-3 py-1.5 text-sm font-medium rounded-lg',
                    'bg-purple-600 text-white hover:bg-purple-700',
                    'transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                  )}
                >
                  Swap
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Token balance list component
 */
export interface TokenBalanceListProps {
  /** List of token balances */
  tokens: TokenBalance[];
  /** Props to pass to each card */
  cardProps?: Partial<TokenBalanceCardProps>;
  /** Custom class name */
  className?: string;
  /** Empty state message */
  emptyMessage?: string;
}

export function TokenBalanceList({
  tokens,
  cardProps,
  className,
  emptyMessage = 'No tokens found',
}: TokenBalanceListProps) {
  if (tokens.length === 0) {
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
    <div className={cn('space-y-3', className)}>
      {tokens.map((token, index) => (
        <TokenBalanceCard key={`${token.symbol}-${index}`} token={token} {...cardProps} />
      ))}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <TokenBalanceCard
 *   token={{
 *     symbol: 'ETH',
 *     name: 'Ethereum',
 *     balance: 1.5,
 *     balanceUSD: 4500,
 *     priceUSD: 3000,
 *     change24h: 5.2,
 *     chain: 'Ethereum',
 *   }}
 *   onSend={(token) => console.log('Send', token)}
 *   onReceive={(token) => console.log('Receive', token)}
 *   onSwap={(token) => console.log('Swap', token)}
 * />
 */

