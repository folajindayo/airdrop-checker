/**
 * Application configuration
 */

import { PAGINATION, AIRDROP_STATUS, STORAGE_KEYS, ROUTES, ERROR_MESSAGES } from "./constants";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

export const config = {
  app: {
    name: "Airdrop Checker",
    version: "1.0.0",
    environment: isDevelopment ? "development" : "production",
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: 30000,
  },

  pagination: PAGINATION,
  airdropStatus: AIRDROP_STATUS,
  storageKeys: STORAGE_KEYS,
  routes: ROUTES,
  errors: ERROR_MESSAGES,

  features: {
    enableNotifications: true,
    enableFavorites: true,
    enableAnalytics: isProduction,
  },

  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
  },

  wallet: {
    autoConnect: false,
    supportedChains: [1, 137, 56, 42161, 10],
  },
} as const;

export type Config = typeof config;

