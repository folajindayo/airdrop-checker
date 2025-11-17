/**
 * Sorter functions for latest onchain features (768-797)
 * Sort data for display and analysis
 */

export function sortByVolume(data: Array<{ volume: string }>): Array<{ volume: string }> {
  return [...data].sort((a, b) => Number(b.volume) - Number(a.volume));
}

export function sortByMarketCap(data: Array<{ marketCap: string }>): Array<{ marketCap: string }> {
  return [...data].sort((a, b) => Number(b.marketCap) - Number(a.marketCap));
}

export function sortByActivityScore(data: Array<{ activityScore: number }>): Array<{ activityScore: number }> {
  return [...data].sort((a, b) => b.activityScore - a.activityScore);
}

export function sortByBalance(data: Array<{ balance: string }>): Array<{ balance: string }> {
  return [...data].sort((a, b) => Number(b.balance) - Number(a.balance));
}

export function sortByDate(data: Array<{ date: string | Date }>): Array<{ date: string | Date }> {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export function sortByContractComplexity(contracts: Array<{ address: string; complexity: number }>): Array<{ address: string; complexity: number }> {
  return [...contracts].sort((a, b) => b.complexity - a.complexity);
}

export function sortByTimelockUrgency(actions: Array<{ id: string; timeRemaining: number }>): Array<{ id: string; timeRemaining: number }> {
  return [...actions].sort((a, b) => a.timeRemaining - b.timeRemaining);
}

export function sortByHolderQuality(holders: Array<{ address: string; qualityScore: number }>): Array<{ address: string; qualityScore: number }> {
  return [...holders].sort((a, b) => b.qualityScore - a.qualityScore);
}

export function sortByInteractionCount(interactions: Array<{ contract: string; count: number }>): Array<{ contract: string; count: number }> {
  return [...interactions].sort((a, b) => b.count - a.count);
}

export function sortByProxyRisk(proxies: Array<{ address: string; risk: number }>): Array<{ address: string; risk: number }> {
  return [...proxies].sort((a, b) => b.risk - a.risk);
}

