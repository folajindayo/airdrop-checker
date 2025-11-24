/**
 * Chain Names Constants
 */

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  56: 'BNB Smart Chain',
  137: 'Polygon',
  250: 'Fantom',
  42161: 'Arbitrum One',
  43114: 'Avalanche C-Chain',
  8453: 'Base',
  59144: 'Linea',
  534352: 'Scroll',
};

export const getChainName = (chainId: number): string => {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
};


