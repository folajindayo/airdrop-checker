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

export function mapToContractType(bytecode: string): 'proxy' | 'smart_wallet' | 'standard' {
  if (bytecode.includes('0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')) {
    return 'proxy';
  }
  if (bytecode.includes('0x5af43d82803e903d91602b57fd5bf3')) {
    return 'smart_wallet';
  }
  return 'standard';
}

export function mapToHolderStability(churnRate: number, retentionRate: number): 'stable' | 'volatile' | 'unstable' {
  const stability = retentionRate - churnRate;
  if (stability > 0.7) return 'stable';
  if (stability > 0.3) return 'volatile';
  return 'unstable';
}

export function mapToTimelockPriority(delay: number, timeRemaining: number): 'low' | 'medium' | 'high' {
  const ratio = timeRemaining / delay;
  if (ratio < 0.1) return 'high';
  if (ratio < 0.5) return 'medium';
  return 'low';
}

export function mapToAccountAbstractionType(code: string | null): 'eoa' | 'smart_contract' | 'account_abstraction' {
  if (!code || code === '0x') return 'eoa';
  if (code.includes('0x5af43d82803e903d91602b57fd5bf3')) return 'account_abstraction';
  return 'smart_contract';
}

