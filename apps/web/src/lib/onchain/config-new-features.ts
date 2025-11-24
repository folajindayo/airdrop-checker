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

export const TIMELOCK_CONFIG = {
  MIN_DELAY: 0,
  MAX_DELAY: 2592000,
  DEFAULT_DELAY: 86400,
} as const;

export const PROXY_CONFIG = {
  EIP1967_IMPLEMENTATION_SLOT: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  DETECTION_PATTERNS: [
    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
    '0x5af43d82803e903d91602b57fd5bf3',
  ],
} as const;

export const HOLDER_SEGMENTATION = {
  WHALE_THRESHOLD: 1,
  DOLPHIN_THRESHOLD: 0.1,
  FISH_THRESHOLD: 0,
} as const;

export const CONTRACT_ANALYSIS = {
  MAX_BYTECODE_SIZE: 24576,
  COMPLEXITY_THRESHOLD: 50,
  FUNCTION_COUNT_THRESHOLD: 20,
} as const;

