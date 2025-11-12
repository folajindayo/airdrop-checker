/**
 * Application-wide constant values
 * Centralizes magic numbers and configuration values
 */

/**
 * Time constants (in milliseconds)
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Score thresholds
 */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 50,
  POOR: 25,
  VERY_POOR: 0,
} as const;

/**
 * Score weights for different airdrop statuses
 */
export const STATUS_WEIGHTS = {
  confirmed: 1.5,
  rumored: 1.0,
  speculative: 0.5,
  expired: 0.0,
} as const;

/**
 * Trending score factors
 */
export const TRENDING_WEIGHTS = {
  STATUS: 0.3,
  VALUE: 0.25,
  SNAPSHOT: 0.2,
  ACTIVITY: 0.15,
  CLAIM: 0.05,
  CHAIN: 0.05,
} as const;

/**
 * Pagination limits
 */
export const PAGINATION_LIMITS = {
  MIN: 1,
  DEFAULT: 10,
  MAX: 100,
  TRENDING: 10,
  SEARCH: 50,
} as const;

/**
 * Wallet limits
 */
export const WALLET_LIMITS = {
  MAX_WATCHLIST: 10,
  MAX_COMPARISON: 5,
  MAX_MULTI_WALLET: 10,
  MAX_BATCH_CHECK: 20,
} as const;

/**
 * Gas price constants (in Gwei)
 */
export const GAS_PRICES = {
  VERY_LOW: 10,
  LOW: 20,
  AVERAGE: 30,
  HIGH: 50,
  VERY_HIGH: 100,
} as const;

/**
 * Transaction types
 */
export const TX_TYPES = {
  SWAP: 'swap',
  BRIDGE: 'bridge',
  MINT: 'mint',
  STAKE: 'stake',
  TRANSFER: 'transfer',
  APPROVE: 'approve',
  CONTRACT_INTERACTION: 'contract_interaction',
} as const;

/**
 * Risk levels
 */
export const RISK_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'none',
} as const;

/**
 * Risk score thresholds
 */
export const RISK_SCORE_THRESHOLDS = {
  CRITICAL: 80,
  HIGH: 60,
  MEDIUM: 40,
  LOW: 20,
} as const;

/**
 * Activity thresholds
 */
export const ACTIVITY_THRESHOLDS = {
  VERY_ACTIVE: 50,
  ACTIVE: 20,
  MODERATE: 5,
  LOW: 1,
  INACTIVE: 0,
} as const;

/**
 * Protocol categories
 */
export const PROTOCOL_CATEGORIES = {
  DEX: 'dex',
  LENDING: 'lending',
  BRIDGE: 'bridge',
  NFT: 'nft',
  DEFI: 'defi',
  GAMING: 'gaming',
  SOCIAL: 'social',
  INFRASTRUCTURE: 'infrastructure',
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  EXPORT: 10 * 1024 * 1024, // 10MB
  BACKUP: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * String length limits
 */
export const STRING_LIMITS = {
  ADDRESS: 42,
  TX_HASH: 66,
  SHORT_TEXT: 100,
  MEDIUM_TEXT: 500,
  LONG_TEXT: 2000,
  USERNAME: 50,
  EMAIL: 255,
} as const;

/**
 * Number limits
 */
export const NUMBER_LIMITS = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
  MAX_RETRY_ATTEMPTS: 5,
  MAX_TIMEOUT_MS: 300000, // 5 minutes
} as const;

/**
 * Currency decimals
 */
export const CURRENCY_DECIMALS = {
  USD: 2,
  ETH: 4,
  GWEI: 2,
  WEI: 0,
  BTC: 8,
} as const;

/**
 * Display limits
 */
export const DISPLAY_LIMITS = {
  MAX_TAGS: 10,
  MAX_VISIBLE_ITEMS: 5,
  MAX_DESCRIPTION_LENGTH: 200,
  MAX_TITLE_LENGTH: 100,
} as const;

/**
 * Sort orders
 */
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Storage keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  THEME: 'airdrop-finder-theme',
  WALLET_ADDRESS: 'airdrop-finder-wallet',
  USER_PREFERENCES: 'airdrop-finder-preferences',
  CACHE_PREFIX: 'airdrop-finder-cache-',
  WATCHLIST: 'airdrop-finder-watchlist',
  NOTIFICATIONS: 'airdrop-finder-notifications',
} as const;

/**
 * Event names for analytics
 */
export const ANALYTICS_EVENTS = {
  WALLET_CONNECTED: 'wallet_connected',
  AIRDROP_CHECKED: 'airdrop_checked',
  EXPORT_DATA: 'export_data',
  SHARE_RESULTS: 'share_results',
  FILTER_APPLIED: 'filter_applied',
  SORT_CHANGED: 'sort_changed',
} as const;

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * Notification durations (in milliseconds)
 */
export const NOTIFICATION_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERSISTENT: 0, // 0 means no auto-dismiss
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Breakpoints for responsive design (in pixels)
 */
export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 1000,
  STICKY: 1100,
  MODAL_BACKDROP: 1200,
  MODAL: 1300,
  POPOVER: 1400,
  TOOLTIP: 1500,
  NOTIFICATION: 1600,
} as const;

/**
 * Color opacity values
 */
export const OPACITY = {
  TRANSPARENT: 0,
  FAINT: 0.1,
  LIGHT: 0.25,
  MEDIUM: 0.5,
  STRONG: 0.75,
  OPAQUE: 1,
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  CURRENCY: 'USD',
  LANGUAGE: 'en',
  THEME: 'system',
  PAGE_SIZE: 10,
  TIMEOUT: 30000,
} as const;

