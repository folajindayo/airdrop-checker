/**
 * Application constants
 */

export const APP_NAME = "Airdrop Checker";
export const APP_VERSION = "1.0.0";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
export const API_TIMEOUT = 30000;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const AIRDROP_STATUS = {
  ACTIVE: "active",
  UPCOMING: "upcoming",
  ENDED: "ended",
  CLAIMED: "claimed",
} as const;

export const CHAINS = [
  { id: "ethereum", name: "Ethereum", logo: "/chains/ethereum.svg" },
  { id: "polygon", name: "Polygon", logo: "/chains/polygon.svg" },
  { id: "bsc", name: "BNB Chain", logo: "/chains/bsc.svg" },
  { id: "arbitrum", name: "Arbitrum", logo: "/chains/arbitrum.svg" },
  { id: "optimism", name: "Optimism", logo: "/chains/optimism.svg" },
  { id: "avalanche", name: "Avalanche", logo: "/chains/avalanche.svg" },
  { id: "base", name: "Base", logo: "/chains/base.svg" },
  { id: "solana", name: "Solana", logo: "/chains/solana.svg" },
] as const;

export const FILTER_OPTIONS = {
  STATUS: Object.values(AIRDROP_STATUS),
  SORT_BY: ["date", "amount", "participants"],
  SORT_ORDER: ["asc", "desc"],
} as const;

export const STORAGE_KEYS = {
  WALLET_ADDRESS: "wallet_address",
  WALLET_CONNECTED: "wallet_connected",
  FAVORITES: "airdrop_favorites",
  THEME: "theme",
  FILTERS: "airdrop_filters",
} as const;

export const TOAST_DURATION = 3000;
export const DEBOUNCE_DELAY = 300;

export const ROUTES = {
  HOME: "/",
  AIRDROPS: "/airdrops",
  CHECK: "/check",
  FAVORITES: "/favorites",
  WALLET: "/wallet",
} as const;

export const ERROR_MESSAGES = {
  WALLET_CONNECTION: "Failed to connect wallet. Please try again.",
  FETCH_AIRDROPS: "Failed to load airdrops. Please refresh the page.",
  CHECK_ELIGIBILITY: "Failed to check eligibility. Please try again.",
  GENERIC: "Something went wrong. Please try again.",
} as const;

