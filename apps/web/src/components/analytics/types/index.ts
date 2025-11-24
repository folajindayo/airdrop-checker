/**
 * Analytics-related type definitions
 */

export interface GasPrice {
  fast: number;
  standard: number;
  slow: number;
}

export interface TransactionAnalytics {
  totalCount: number;
  totalValue: number;
  averageGasUsed: number;
}
