/**
 * Query filtering utilities
 */

export function filterByStatus<T extends { status: string }>(
  items: T[],
  status?: string
): T[] {
  if (!status) return items;
  return items.filter(item => item.status === status);
}

export function filterByChain<T extends { chainId?: number }>(
  items: T[],
  chainId?: number
): T[] {
  if (!chainId) return items;
  return items.filter(item => item.chainId === chainId);
}

export function filterByDateRange<T extends { timestamp?: number }>(
  items: T[],
  startDate?: number,
  endDate?: number
): T[] {
  return items.filter(item => {
    if (!item.timestamp) return true;
    if (startDate && item.timestamp < startDate) return false;
    if (endDate && item.timestamp > endDate) return false;
    return true;
  });
}

