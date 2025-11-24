/**
 * Airdrop Status Constants
 */

export const AIRDROP_STATUSES = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  ENDED: 'ended',
  CLAIMED: 'claimed',
  EXPIRED: 'expired',
} as const;

export type AirdropStatusType = typeof AIRDROP_STATUSES[keyof typeof AIRDROP_STATUSES];

export const AIRDROP_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  ended: 'Ended',
  claimed: 'Claimed',
  expired: 'Expired',
};


