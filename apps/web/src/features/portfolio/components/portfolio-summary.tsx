/**
 * @fileoverview Portfolio summary component
 * 
 * Displays a comprehensive portfolio overview with charts and metrics
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/format';

/**
 * Asset allocation
 */
export interface AssetAllocation {
  /** Asset symbol */
  symbol: string;
  /** Asset name */
  name: string;
  /** Percentage of portfolio */
  percentage: number;
  /** Value in USD */
  valueUSD: number;
  /** Color for charts */
  color: string;
}

/**
 * Portfolio metrics
 */
export interface PortfolioMetrics {
  /** Total value in USD */
  totalValueUSD: number;
  /** 24h change percentage */
  change24h: number;
  /** 24h change value in USD */
  change24hUSD: number;
  /** 7d change percentage */
  change7d?: number;
  /** 30d change percentage */
  change30d?: number;
  /** All-time high */
  allTimeHigh?: number;
  /** All-time low */
  allTimeLow?: number;
}

/**
 * Chain distribution
 */
export interface ChainDistribution {
  /** Chain name */
  chain: string;
  /** Value in USD */
  valueUSD: number;
  /** Percentage of portfolio */
  percentage: number;
  /** Number of tokens */
  tokenCount: number;
  /** Icon or emoji */
  icon?: string;
}

/**
 * Portfolio summary data
 */
export interface PortfolioSummaryData {
  /** Portfolio metrics */
  metrics: PortfolioMetrics;
  /** Asset allocation */
  assets: AssetAllocation[];
  /** Chain distribution */
  chains: ChainDistribution[];
}

/**
 * Portfolio summary props
 */
export interface PortfolioSummaryProps {
  /** Portfolio data */
  data: PortfolioSummaryData;
  /** Show charts */
  showCharts?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Metric card component
 */
function MetricCard({
  label,
  value,
  change,
  icon,
  className,
}: {
  label: string;
  value: string;
  change?: string;
  icon?: string;
  className?: string;
}) {
  const isPositive = change && !change.startsWith('-');

  return (
    <div
      className={cn(
        'p-4 rounded-lg',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      
      {change && (
        <div
          className={cn(
            'text-sm font-medium flex items-center gap-1',
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >
          {isPositive ? '↑' : '↓'}
          {change}
        </div>
      )}
    </div>
  );
}

/**
 * Asset allocation item
 */
function AssetItem({ asset }: { asset: AssetAllocation }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: asset.color }}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {asset.symbol}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatPercentage(asset.percentage)}
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {asset.name}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(asset.valueUSD)}
        </div>
      </div>
    </div>
  );
}

/**
 * Chain distribution item
 */
function ChainItem({ chain }: { chain: ChainDistribution }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      {chain.icon && <span className="text-2xl">{chain.icon}</span>}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-900 dark:text-white">
            {chain.chain}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatPercentage(chain.percentage)}
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {chain.tokenCount} {chain.tokenCount === 1 ? 'token' : 'tokens'}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(chain.valueUSD)}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple donut chart
 */
function DonutChart({ items }: { items: Array<{ percentage: number; color: string }> }) {
  let currentAngle = 0;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="20"
          className="dark:stroke-gray-700"
        />
        
        {items.map((item, index) => {
          const circumference = 2 * Math.PI * 40;
          const offset = circumference - (item.percentage / 100) * circumference;
          const rotation = (currentAngle / 100) * 360;
          currentAngle += item.percentage;

          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: '50% 50%',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Portfolio summary component
 */
export function PortfolioSummary({
  data,
  showCharts = true,
  className,
}: PortfolioSummaryProps) {
  const { metrics, assets, chains } = data;
  const changeIsPositive = metrics.change24h >= 0;

  // Prepare chart data
  const topAssets = assets.slice(0, 5);
  const chartItems = topAssets.map((asset) => ({
    percentage: asset.percentage,
    color: asset.color,
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Metrics */}
      <div>
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(metrics.totalValueUSD)}
          </h2>
          <div
            className={cn(
              'text-lg font-medium flex items-center gap-2',
              changeIsPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {changeIsPositive ? '↑' : '↓'}
            {formatCurrency(Math.abs(metrics.change24hUSD))}
            <span className="text-sm">
              ({formatPercentage(Math.abs(metrics.change24h))})
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">24h</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.change7d !== undefined && (
            <MetricCard
              label="7 Day Change"
              value={formatPercentage(Math.abs(metrics.change7d))}
              change={metrics.change7d >= 0 ? `+${formatPercentage(metrics.change7d)}` : formatPercentage(metrics.change7d)}
              icon="📊"
            />
          )}

          {metrics.change30d !== undefined && (
            <MetricCard
              label="30 Day Change"
              value={formatPercentage(Math.abs(metrics.change30d))}
              change={metrics.change30d >= 0 ? `+${formatPercentage(metrics.change30d)}` : formatPercentage(metrics.change30d)}
              icon="📈"
            />
          )}

          {metrics.allTimeHigh !== undefined && (
            <MetricCard
              label="All-Time High"
              value={formatCurrency(metrics.allTimeHigh)}
              icon="🎯"
            />
          )}

          {metrics.allTimeLow !== undefined && (
            <MetricCard
              label="All-Time Low"
              value={formatCurrency(metrics.allTimeLow)}
              icon="📉"
            />
          )}
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="grid md:grid-cols-2 gap-6">
        <div
          className={cn(
            'p-6 rounded-lg',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700'
          )}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Asset Allocation
          </h3>

          {showCharts && assets.length > 0 && (
            <DonutChart items={chartItems} />
          )}

          <div className="mt-4 space-y-1">
            {topAssets.map((asset, index) => (
              <AssetItem key={index} asset={asset} />
            ))}
          </div>

          {assets.length > 5 && (
            <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
              +{assets.length - 5} more assets
            </div>
          )}
        </div>

        {/* Chain Distribution */}
        <div
          className={cn(
            'p-6 rounded-lg',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700'
          )}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Chain Distribution
          </h3>

          <div className="space-y-1">
            {chains.map((chain, index) => (
              <ChainItem key={index} chain={chain} />
            ))}
          </div>

          {chains.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No chain data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example usage:
 * 
 * <PortfolioSummary
 *   data={{
 *     metrics: {
 *       totalValueUSD: 50000,
 *       change24h: 5.2,
 *       change24hUSD: 2600,
 *       change7d: 12.5,
 *       change30d: -3.2,
 *       allTimeHigh: 75000,
 *       allTimeLow: 10000,
 *     },
 *     assets: [
 *       {
 *         symbol: 'ETH',
 *         name: 'Ethereum',
 *         percentage: 45,
 *         valueUSD: 22500,
 *         color: '#627EEA',
 *       },
 *     ],
 *     chains: [
 *       {
 *         chain: 'Ethereum',
 *         valueUSD: 30000,
 *         percentage: 60,
 *         tokenCount: 15,
 *         icon: '⟠',
 *       },
 *     ],
 *   }}
 * />
 */

