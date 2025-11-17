/**
 * Bridge monitoring helper functions for features 798-827
 * Utilities for Layer 2 bridge activity and efficiency analysis
 */

export function calculateBridgeEfficiency(completed: number, total: number): number {
  if (total === 0) return 0;
  return (completed / total) * 100;
}

export function formatBridgeVolume(volume: string): string {
  const num = Number(volume);
  if (num < 1000) return `${num.toFixed(2)}`;
  if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
  return `${(num / 1000000).toFixed(2)}M`;
}

export function getBridgeStatus(efficiency: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (efficiency >= 95) return 'excellent';
  if (efficiency >= 80) return 'good';
  if (efficiency >= 60) return 'fair';
  return 'poor';
}

export function calculateBridgeCost(volume: string, fee: number): string {
  const vol = Number(volume);
  return (vol * (fee / 100)).toString();
}

export function formatChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    137: 'Polygon',
  };
  return chains[chainId] || `Chain ${chainId}`;
}

