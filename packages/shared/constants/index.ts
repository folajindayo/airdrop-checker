export * from './chains';

export const CACHE_TTL = {
  AIRDROP_CHECK: 60 * 60 * 1000, // 1 hour
  AIRDROPS_LIST: 5 * 60 * 1000, // 5 minutes
  GOLDRUSH_DATA: 60 * 60 * 1000, // 1 hour
};

export const RATE_LIMITS = {
  REFRESH_COOLDOWN: 5 * 60 * 1000, // 5 minutes
};

export const API_CONFIG = {
  GOLDRUSH_BASE_URL: 'https://api.covalenthq.com/v1',
  REQUEST_TIMEOUT: 10000, // 10 seconds
};

