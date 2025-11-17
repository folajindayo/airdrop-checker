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

