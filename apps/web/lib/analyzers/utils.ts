import type { AirdropProject } from '@airdrop-finder/shared';

const VALUE_MULTIPLIERS: Record<string, number> = {
  k: 1e3,
  m: 1e6,
  b: 1e9,
  t: 1e12,
};

export function parseEstimatedValue(value?: string): number {
  if (!value) return 0;

  const normalized = value.replace(/[$,\s]/g, '').toLowerCase();
  const match = normalized.match(/([\d.]+)([kmbt]?)/);
  if (!match) return 0;

  const amount = parseFloat(match[1]);
  const suffix = match[2];

  if (Number.isNaN(amount)) return 0;
  return amount * (VALUE_MULTIPLIERS[suffix] ?? 1);
}

export function daysUntil(date: string | undefined): number | null {
  if (!date) return null;
  const target = new Date(date).getTime();
  if (Number.isNaN(target)) return null;

  const diffMs = target - Date.now();
  return diffMs / (1000 * 60 * 60 * 24);
}

export function sortBySnapshotAscending(projects: AirdropProject[]): AirdropProject[] {
  return [...projects].sort((a, b) => {
    const aTime = a.snapshotDate ? new Date(a.snapshotDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.snapshotDate ? new Date(b.snapshotDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}



