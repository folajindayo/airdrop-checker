/**
 * Portfolio Utility Functions
 * 
 * Helper functions for portfolio calculations and formatting
 */

import { PortfolioData, PortfolioToken, WalletHealth } from './types';

/**
 * Calculate total portfolio value
 */
export function calculateTotalValue(portfolio: PortfolioData): number {
  return portfolio.chains.reduce((total, chain) => {
    return total + chain.value;
  }, 0);
}

/**
 * Calculate portfolio diversification score (0-100)
 */
export function calculateDiversification(tokens: PortfolioToken[]): number {
  if (tokens.length === 0) return 0;
  if (tokens.length === 1) return 0;
  
  const totalValue = tokens.reduce((sum, token) => sum + token.valueUSD, 0);
  const concentrations = tokens.map(token => token.valueUSD / totalValue);
  
  // Calculate Herfindahl-Hirschman Index (HHI)
  const hhi = concentrations.reduce((sum, c) => sum + c * c, 0);
  
  // Normalize to 0-100 scale (lower HHI = better diversification)
  return Math.round((1 - hhi) * 100);
}

/**
 * Calculate wallet health score
 */
export function calculateWalletHealth(
  portfolio: PortfolioData,
  gasData: { totalSpent: number; totalTransactions: number }
): WalletHealth {
  const diversification = calculateDiversification(
    portfolio.chains.flatMap(c => c.tokens)
  );
  
  const activityLevel = Math.min(100, (gasData.totalTransactions / 10) * 10);
  
  const avgGasPerTx = gasData.totalSpent / gasData.totalTransactions;
  const riskLevel = avgGasPerTx > 50 ? 80 : avgGasPerTx > 20 ? 50 : 20;
  
  const score = Math.round(
    (diversification * 0.4 + activityLevel * 0.3 + (100 - riskLevel) * 0.3)
  );
  
  const suggestions: string[] = [];
  if (diversification < 30) {
    suggestions.push('Consider diversifying your portfolio across more tokens');
  }
  if (activityLevel < 30) {
    suggestions.push('Increase wallet activity for better airdrop eligibility');
  }
  if (riskLevel > 50) {
    suggestions.push('High gas spending detected - consider gas optimization');
  }
  
  return {
    score,
    diversification,
    activityLevel,
    riskLevel,
    suggestions,
  };
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage change
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Sort tokens by value (descending)
 */
export function sortTokensByValue(tokens: PortfolioToken[]): PortfolioToken[] {
  return [...tokens].sort((a, b) => b.valueUSD - a.valueUSD);
}

/**
 * Filter tokens by minimum value
 */
export function filterTokensByValue(
  tokens: PortfolioToken[],
  minValue: number
): PortfolioToken[] {
  return tokens.filter(token => token.valueUSD >= minValue);
}

/**
 * Group tokens by chain
 */
export function groupTokensByChain(tokens: PortfolioToken[]): Record<string, PortfolioToken[]> {
  return tokens.reduce((acc, token) => {
    if (!acc[token.chain]) {
      acc[token.chain] = [];
    }
    acc[token.chain].push(token);
    return acc;
  }, {} as Record<string, PortfolioToken[]>);
}

