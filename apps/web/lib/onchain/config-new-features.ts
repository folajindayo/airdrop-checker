/**
 * Configuration for latest onchain features (768-797)
 * Settings and defaults for new feature endpoints
 */

export const FEATURE_CONFIG = {
  DEFAULT_CHAIN_ID: 1,
  DEFAULT_DECIMALS: 18,
  WHALE_THRESHOLD_PERCENT: 1,
  ACTIVITY_SCORE_THRESHOLD: 70,
  RETENTION_RATE_THRESHOLD: 0.75,
  PEG_DEVIATION_THRESHOLD: 0.5,
} as const;

export const SUPPORTED_DEXS = [
  'Uniswap',
  'SushiSwap',
  'Curve',
  'Balancer',
  'PancakeSwap',
] as const;

export const SUPPORTED_BRIDGES = [
  'Stargate',
  'Hop Protocol',
  'Across',
  'Synapse',
] as const;

