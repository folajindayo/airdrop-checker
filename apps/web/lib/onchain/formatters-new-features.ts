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

