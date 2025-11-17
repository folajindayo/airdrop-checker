/**
 * Formatter functions for latest onchain features (768-797)
 * Format data for display and API responses
 */

export function formatMarketCap(marketCap: string): string {
  const num = Number(marketCap);
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function formatVolume(volume: string): string {
  const num = Number(volume);
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatActivityLevel(score: number): 'low' | 'medium' | 'high' {
  if (score > 70) return 'high';
  if (score > 40) return 'medium';
  return 'low';
}

export function formatPegStatus(deviation: number): 'stable' | 'deviating' | 'unstable' {
  if (Math.abs(deviation) < 0.5) return 'stable';
  if (Math.abs(deviation) < 2) return 'deviating';
  return 'unstable';
}

export function formatTimelockDelay(delaySeconds: number): string {
  if (delaySeconds < 60) return `${delaySeconds}s`;
  if (delaySeconds < 3600) return `${Math.floor(delaySeconds / 60)}m`;
  if (delaySeconds < 86400) return `${Math.floor(delaySeconds / 3600)}h`;
  return `${Math.floor(delaySeconds / 86400)}d`;
}

export function formatContractSize(size: number): string {
  if (size < 1024) return `${size}B`;
  if (size < 1048576) return `${(size / 1024).toFixed(2)}KB`;
  return `${(size / 1048576).toFixed(2)}MB`;
}

export function formatHolderSegment(percentage: number): 'whale' | 'dolphin' | 'fish' {
  if (percentage > 1) return 'whale';
  if (percentage > 0.1) return 'dolphin';
  return 'fish';
}

export function formatProxyStatus(isProxy: boolean, hasUpgrade: boolean): string {
  if (!isProxy) return 'not_proxy';
  if (hasUpgrade) return 'upgradeable';
  return 'proxy';
}

