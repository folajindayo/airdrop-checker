/**
 * Mapper functions for latest onchain features (768-797)
 * Map data between different structures
 */

export function mapToHolderActivity(data: {
  transactionCount: number;
  balance: string;
}): {
  activityScore: number;
  activityLevel: 'low' | 'medium' | 'high';
} {
  const score = Math.min((data.transactionCount / 10) * 100, 100);
  return {
    activityScore: Math.round(score),
    activityLevel: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
  };
}

export function mapToMarketData(data: {
  supply: string;
  price: string;
}): {
  marketCap: string;
  fullyDiluted: string;
} {
  const supply = Number(data.supply);
  const price = Number(data.price);
  return {
    marketCap: (supply * price).toString(),
    fullyDiluted: (supply * price).toString(),
  };
}

export function mapToVolumeTrend(volumes: Array<{ period: string; volume: string }>): string {
  if (volumes.length < 2) return 'stable';
  const recent = Number(volumes[volumes.length - 1].volume);
  const previous = Number(volumes[volumes.length - 2].volume);
  const change = ((recent - previous) / previous) * 100;
  if (change > 10) return 'increasing';
  if (change < -10) return 'decreasing';
  return 'stable';
}

export function mapToPegStatus(deviation: number): 'stable' | 'deviating' | 'unstable' {
  if (Math.abs(deviation) < 0.5) return 'stable';
  if (Math.abs(deviation) < 2) return 'deviating';
  return 'unstable';
}

