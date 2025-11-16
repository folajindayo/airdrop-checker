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

