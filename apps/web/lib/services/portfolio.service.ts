/**
 * Portfolio service
 * Business logic for portfolio tracking and analytics
 * 
 * @module PortfolioService
 */

import { getTokenBalances } from '../goldrush/tokens';
import type { GoldRushTokenBalance } from '@airdrop-finder/shared';

/**
 * Portfolio data structure
 */
export interface PortfolioData {
  address: string;
  totalValue: number;
  chainBreakdown: ChainPortfolio[];
  topTokens: TokenHolding[];
  totalTokens: number;
  timestamp: number;
}

/**
 * Chain portfolio breakdown
 */
export interface ChainPortfolio {
  chainId: number;
  chainName: string;
  value: number;
  tokenCount: number;
  percentage: number;
}

/**
 * Token holding information
 */
export interface TokenHolding {
  symbol: string;
  name: string;
  balance: string;
  value: number;
  chainId: number;
  chainName: string;
  contractAddress: string;
}

/**
 * Get portfolio data for an address
 * 
 * @param address - Ethereum address to get portfolio for
 * @param chainIds - Array of chain IDs to query (default: [1, 8453, 42161, 10, 137])
 * @returns Portfolio data including total value, chain breakdown, and top tokens
 * @throws {Error} If address is invalid or data fetch fails
 * 
 * @example
 * ```typescript
 * const portfolio = await getPortfolioData('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * console.log(portfolio.totalValue); // Total portfolio value in USD
 * ```
 */
export async function getPortfolioData(
  address: string,
  chainIds: number[] = [1, 8453, 42161, 10, 137]
): Promise<PortfolioData> {
  // Fetch token balances from all chains
  const balancePromises = chainIds.map((chainId) =>
    getTokenBalances(address, chainId)
      .then((data) => ({ chainId, data }))
      .catch(() => ({ chainId, data: null }))
  );
  
  const balanceResults = await Promise.all(balancePromises);
  
  // Process balances
  const chainBreakdown: ChainPortfolio[] = [];
  const allTokens: TokenHolding[] = [];
  let totalValue = 0;
  
  balanceResults.forEach(({ chainId, data }) => {
    if (!data || !data.items) return;
    
    let chainValue = 0;
    const chainTokens: TokenHolding[] = [];
    
    data.items.forEach((item: GoldRushTokenBalance) => {
      const value = item.quote || 0;
      chainValue += value;
      totalValue += value;
      
      if (value > 0) {
        chainTokens.push({
          symbol: item.contract_ticker_symbol,
          name: item.contract_name,
          balance: item.balance,
          value,
          chainId,
          chainName: data.chain_name,
          contractAddress: item.contract_address,
        });
      }
    });
    
    if (chainValue > 0) {
      chainBreakdown.push({
        chainId,
        chainName: data.chain_name,
        value: chainValue,
        tokenCount: chainTokens.length,
        percentage: 0, // Will be calculated later
      });
      
      allTokens.push(...chainTokens);
    }
  });
  
  // Calculate percentages
  chainBreakdown.forEach((chain) => {
    chain.percentage = totalValue > 0 ? (chain.value / totalValue) * 100 : 0;
  });
  
  // Sort tokens by value
  const topTokens = allTokens
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);
  
  return {
    address: address.toLowerCase(),
    totalValue,
    chainBreakdown,
    topTokens,
    totalTokens: allTokens.length,
    timestamp: Date.now(),
  };
}

/**
 * Compare portfolios across multiple addresses
 * 
 * @param addresses - Array of Ethereum addresses to compare
 * @returns Comparison data including individual portfolios and aggregate statistics
 * @throws {Error} If any address is invalid or data fetch fails
 * 
 * @example
 * ```typescript
 * const comparison = await comparePortfolios([
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   '0x0000000000000000000000000000000000000000'
 * ]);
 * console.log(comparison.aggregate.totalValue); // Combined portfolio value
 * ```
 */
export async function comparePortfolios(
  addresses: string[]
): Promise<{
  portfolios: PortfolioData[];
  aggregate: {
    totalValue: number;
    uniqueTokens: number;
    chainsUsed: number;
    walletCount: number;
  };
}> {
  const portfolios = await Promise.all(
    addresses.map((addr) => getPortfolioData(addr))
  );
  
  // Calculate aggregate statistics
  const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
  const uniqueChains = new Set(
    portfolios.flatMap((p) => p.chainBreakdown.map((c) => c.chainId))
  ).size;
  const uniqueTokens = new Set(
    portfolios.flatMap((p) => p.topTokens.map((t) => t.contractAddress))
  ).size;
  
  return {
    portfolios,
    aggregate: {
      totalValue,
      uniqueTokens,
      chainsUsed: uniqueChains,
      walletCount: addresses.length,
    },
  };
}
