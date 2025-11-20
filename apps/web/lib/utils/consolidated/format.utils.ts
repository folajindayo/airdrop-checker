/**
 * Format Utilities
 * Formatting functions for various data types
 */

/**
 * Format token amount with symbol
 */
export function formatTokenAmount(
  amount: string | number,
  symbol: string,
  decimals: number = 18
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const value = num / Math.pow(10, decimals);
  
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M ${symbol}`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K ${symbol}`;
  }
  
  return `${value.toFixed(4)} ${symbol}`;
}

/**
 * Format USD amount
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format gas price in gwei
 */
export function formatGwei(wei: string | number): string {
  const weiNum = typeof wei === 'string' ? BigInt(wei) : BigInt(wei);
  const gwei = Number(weiNum) / 1e9;
  return `${gwei.toFixed(2)} Gwei`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format duration
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Format transaction hash
 */
export function formatTxHash(hash: string, length: number = 10): string {
  if (hash.length <= length) return hash;
  const start = Math.floor(length / 2);
  const end = Math.ceil(length / 2);
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
}

/**
 * Format credit card number
 */
export function formatCreditCard(card: string): string {
  return card.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/**
 * Format list with commas and 'and'
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  return `${rest.join(', ')}, and ${last}`;
}

/**
 * Format JSON with indentation
 */
export function formatJSON(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Format code for display
 */
export function formatCode(code: string, language: string = 'javascript'): string {
  // Basic formatting - in production use a proper syntax highlighter
  return code
    .split('\n')
    .map((line, i) => `${i + 1} | ${line}`)
    .join('\n');
}

