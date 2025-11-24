/**
 * Cache strategies
 */

import { cache, CACHE_TTL } from '@airdrop-finder/shared';

export const cacheStrategies = {
  airdropCheck: {
    get: (address: string) => cache.get(`airdrop-check:${address}`),
    set: (address: string, data: any) => cache.set(`airdrop-check:${address}`, data, CACHE_TTL.AIRDROP_CHECK),
  },
  portfolio: {
    get: (address: string) => cache.get(`portfolio:${address}`),
    set: (address: string, data: any) => cache.set(`portfolio:${address}`, data, CACHE_TTL.PORTFOLIO),
  },
  gasTracker: {
    get: (address: string) => cache.get(`gas-tracker:${address}`),
    set: (address: string, data: any) => cache.set(`gas-tracker:${address}`, data, CACHE_TTL.GAS_TRACKER),
  },
};

