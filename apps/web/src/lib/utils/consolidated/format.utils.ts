/**
 * Format Utilities
 */

export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatBalance(balance: number): string {
  if (balance >= 1000000) return (balance / 1000000).toFixed(2) + 'M';
  if (balance >= 1000) return (balance / 1000).toFixed(2) + 'K';
  return balance.toFixed(2);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
