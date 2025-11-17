/**
 * Aggregator functions for latest onchain features (768-797)
 * Aggregate data across multiple sources and chains
 */

export function aggregateDEXPrices(prices: Array<{ dex: string; price: string }>): {
  bestPrice: string;
  bestDex: string;
  averagePrice: string;
} {
  if (prices.length === 0) {
    return { bestPrice: '0', bestDex: '', averagePrice: '0' };
  }

  const priceNums = prices.map((p) => Number(p.price));
  const bestIndex = priceNums.indexOf(Math.max(...priceNums));
  const average = priceNums.reduce((a, b) => a + b, 0) / priceNums.length;

  return {
    bestPrice: prices[bestIndex].price,
    bestDex: prices[bestIndex].dex,
    averagePrice: average.toString(),
  };
}

export function aggregateCrossChainBalances(balances: Array<{ chainId: number; balance: string }>): {
  totalBalance: string;
  chains: number;
} {
  const total = balances.reduce((sum, b) => sum + BigInt(b.balance), 0n);
  return {
    totalBalance: total.toString(),
    chains: balances.length,
  };
}

export function aggregateVolumeData(volumes: Array<{ period: string; volume: string }>): {
  totalVolume: string;
  averageVolume: string;
} {
  if (volumes.length === 0) {
    return { totalVolume: '0', averageVolume: '0' };
  }

  const total = volumes.reduce((sum, v) => sum + BigInt(v.volume), 0n);
  const average = total / BigInt(volumes.length);

  return {
    totalVolume: total.toString(),
    averageVolume: average.toString(),
  };
}

export function aggregateContractInteractions(interactions: Array<{ contract: string; count: number }>): {
  totalInteractions: number;
  uniqueContracts: number;
} {
  const total = interactions.reduce((sum, i) => sum + i.count, 0);
  const unique = new Set(interactions.map((i) => i.contract)).size;
  return { totalInteractions: total, uniqueContracts: unique };
}

export function aggregateHolderSegments(holders: Array<{ segment: string; count: number }>): {
  whales: number;
  dolphins: number;
  fish: number;
} {
  const segments = holders.reduce(
    (acc, h) => {
      if (h.segment === 'whale') acc.whales += h.count;
      else if (h.segment === 'dolphin') acc.dolphins += h.count;
      else acc.fish += h.count;
      return acc;
    },
    { whales: 0, dolphins: 0, fish: 0 }
  );
  return segments;
}

export function aggregateTimelockActions(actions: Array<{ status: string; delay: number }>): {
  pending: number;
  executed: number;
  averageDelay: number;
} {
  const pending = actions.filter((a) => a.status === 'pending').length;
  const executed = actions.filter((a) => a.status === 'executed').length;
  const avgDelay = actions.length > 0 ? actions.reduce((sum, a) => sum + a.delay, 0) / actions.length : 0;
  return { pending, executed, averageDelay: avgDelay };
}

