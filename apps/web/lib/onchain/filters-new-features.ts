/**
 * Filter functions for latest onchain features (768-797)
 * Filter and process data for analytics
 */

export function filterWhaleTransactions(transactions: any[], threshold: string): any[] {
  const thresholdNum = Number(threshold);
  return transactions.filter((tx) => Number(tx.value || 0) >= thresholdNum);
}

export function filterByTimeRange(data: any[], startDate: Date, endDate: Date): any[] {
  return data.filter((item) => {
    const itemDate = new Date(item.timestamp || item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

export function filterByChain(transactions: any[], chainId: number): any[] {
  return transactions.filter((tx) => tx.chainId === chainId);
}

export function filterActiveHolders(holders: any[], minBalance: string): any[] {
  const min = Number(minBalance);
  return holders.filter((holder) => Number(holder.balance || 0) >= min);
}

export function filterHighActivity(transactions: any[], minCount: number): any[] {
  const counts = new Map<string, number>();
  transactions.forEach((tx) => {
    const key = tx.from || tx.address;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .filter(([_, count]) => count >= minCount)
    .map(([address]) => ({ address }));
}

