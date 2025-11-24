/**
 * Holder analysis helper functions for features 798-827
 * Utilities for holder segmentation and quality analysis
 */

export function calculateHolderSegment(balance: string, totalSupply: string): 'whale' | 'dolphin' | 'fish' {
  const bal = Number(balance);
  const supply = Number(totalSupply);
  if (supply === 0) return 'fish';
  const percentage = (bal / supply) * 100;
  if (percentage > 1) return 'whale';
  if (percentage > 0.1) return 'dolphin';
  return 'fish';
}

export function calculateChurnRate(lostHolders: number, totalHolders: number): number {
  if (totalHolders === 0) return 0;
  return (lostHolders / totalHolders) * 100;
}

export function calculateRetentionRate(activeHolders: number, totalHolders: number): number {
  if (totalHolders === 0) return 0;
  return (activeHolders / totalHolders) * 100;
}

export function calculateHolderGrowthRate(newHolders: number, previousHolders: number, days: number): number {
  if (previousHolders === 0 || days === 0) return 0;
  return ((newHolders / previousHolders) * 100) / days;
}

export function formatHolderAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

