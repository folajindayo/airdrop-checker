/**
 * Features Configuration
 */

export const FEATURES = {
  PORTFOLIO_TRACKING: true,
  AIRDROP_CHECKER: true,
  MULTI_CHAIN: true,
  NFT_SUPPORT: false,
  ANALYTICS: true,
  NOTIFICATIONS: false,
} as const;

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}

