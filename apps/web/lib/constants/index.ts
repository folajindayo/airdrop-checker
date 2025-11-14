/**
 * Application Constants
 * 
 * Centralized constants used throughout the application.
 */

/**
 * Application Metadata
 */
export const APP_NAME = 'Airdrop Checker';
export const APP_DESCRIPTION = 'Check your airdrop eligibility across multiple blockchain networks';
export const APP_VERSION = '1.0.0';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * API Configuration
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRIES = 3;

/**
 * Cache Configuration
 */
export const CACHE_TTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  SHORT: 'MMM D, YYYY',
  LONG: 'MMMM D, YYYY',
  FULL: 'MMMM D, YYYY h:mm A',
  TIME: 'h:mm A',
  ISO: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
} as const;

/**
 * Number Formats
 */
export const NUMBER_FORMATS = {
  COMPACT: 'compact',
  CURRENCY: 'currency',
  PERCENT: 'percent',
  DECIMAL: 'decimal',
} as const;

/**
 * Currency
 */
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'] as const;
export const DEFAULT_CURRENCY = 'USD';

/**
 * Supported Languages
 */
export const LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh'] as const;
export const DEFAULT_LANGUAGE = 'en';

/**
 * Theme
 */
export const THEMES = ['light', 'dark', 'auto'] as const;
export const DEFAULT_THEME = 'auto';

/**
 * Airdrop Status
 */
export const AIRDROP_STATUS = {
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
  ENDED: 'ended',
  DISTRIBUTED: 'distributed',
} as const;

/**
 * Airdrop Categories
 */
export const AIRDROP_CATEGORIES = [
  'DeFi',
  'NFT',
  'Gaming',
  'Social',
  'Infrastructure',
  'DAO',
  'Metaverse',
  'Other',
] as const;

/**
 * Transaction Status
 */
export const TRANSACTION_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
} as const;

/**
 * Health Status
 */
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
} as const;

/**
 * Service Status
 */
export const SERVICE_STATUS = {
  UP: 'up',
  DOWN: 'down',
  DEGRADED: 'degraded',
} as const;

/**
 * Rate Limiting
 */
export const RATE_LIMIT = {
  WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS: 60,
  WHITELIST: [] as string[],
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  CURRENCY: 'currency',
  WALLET_ADDRESS: 'wallet_address',
  RECENT_SEARCHES: 'recent_searches',
  FAVORITES: 'favorites',
  NOTIFICATIONS: 'notifications',
} as const;

/**
 * Cookie Names
 */
export const COOKIE_NAMES = {
  SESSION: 'session',
  CONSENT: 'cookie_consent',
  PREFERENCES: 'preferences',
} as const;

/**
 * Query Param Names
 */
export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SORT_BY: 'sortBy',
  SORT_ORDER: 'sortOrder',
  SEARCH: 'search',
  STATUS: 'status',
  CATEGORY: 'category',
} as const;

/**
 * Validation
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ETHEREUM_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  URL_REGEX: /^https?:\/\/.+/,
} as const;

/**
 * File Upload
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

/**
 * Toast/Notification Duration
 */
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
} as const;

/**
 * Animation Duration
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Breakpoints (matches Tailwind)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Social Media Links
 */
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/airdropchecker',
  DISCORD: 'https://discord.gg/airdropchecker',
  TELEGRAM: 'https://t.me/airdropchecker',
  GITHUB: 'https://github.com/airdropchecker',
} as const;

/**
 * External URLs
 */
export const EXTERNAL_URLS = {
  DOCUMENTATION: 'https://docs.airdropchecker.com',
  API_DOCS: 'https://api.airdropchecker.com/docs',
  SUPPORT: 'https://support.airdropchecker.com',
  BLOG: 'https://blog.airdropchecker.com',
} as const;

/**
 * Feature Flags
 */
export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
  ANALYTICS: true,
  WEB3_INTEGRATION: true,
  NFT_SUPPORT: true,
  DEFI_TRACKING: true,
  SOCIAL_LOGIN: false,
  ADVANCED_CHARTS: false,
} as const;

/**
 * Regular Expressions
 */
export const REGEX = {
  EMAIL: VALIDATION.EMAIL_REGEX,
  ETH_ADDRESS: VALIDATION.ETHEREUM_ADDRESS_REGEX,
  URL: VALIDATION.URL_REGEX,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IPV4: /^(\d{1,3}\.){3}\d{1,3}$/,
  TWITTER_HANDLE: /^@?[A-Za-z0-9_]{1,15}$/,
} as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  AVATAR: '/images/default-avatar.png',
  LOGO: '/images/default-logo.png',
  IMAGE: '/images/default-image.png',
  BANNER: '/images/default-banner.png',
} as const;

/**
 * Time Constants (in milliseconds)
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
 * Units
 */
export const UNITS = {
  WEI: 1,
  GWEI: 1e9,
  ETHER: 1e18,
} as const;
