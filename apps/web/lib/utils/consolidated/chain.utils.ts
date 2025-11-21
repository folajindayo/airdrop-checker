/**
 * Chain Utilities
 */

export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    56: 'BNB Chain',
    43114: 'Avalanche',
  };
  return chains[chainId] || `Chain ${chainId}`;
}

export function getExplorerUrl(chainId: number): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    8453: 'https://basescan.org',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
  };
  return explorers[chainId] || '';
}

