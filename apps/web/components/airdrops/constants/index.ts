/**
 * Airdrop-related constants
 */

export const AIRDROP_STATUS = {
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
  ENDED: 'ended',
  CLAIMED: 'claimed',
} as const;

export const ELIGIBILITY_THRESHOLDS = {
  MIN_TRANSACTIONS: 5,
  MIN_VALUE_USD: 100,
  MIN_UNIQUE_DAYS: 3,
} as const;

