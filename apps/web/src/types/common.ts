/**
 * Common shared types across the application
 * @module types/common
 */

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Wallet address type
 */
export type Address = string;

/**
 * Transaction hash type
 */
export type TxHash = string;

/**
 * Status enum
 */
export type Status = 'pending' | 'success' | 'failed' | 'cancelled';

/**
 * Theme type
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Currency code
 */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY';

/**
 * Date range
 */
export interface DateRange {
  start: string | Date;
  end: string | Date;
}

/**
 * Coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Key-value pair
 */
export interface KeyValue<K = string, V = any> {
  key: K;
  value: V;
}

/**
 * Option for select inputs
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}

/**
 * File upload info
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt?: string;
}

/**
 * Color scheme
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: Theme;
  currency: CurrencyCode;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    airdropAlerts: boolean;
  };
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Feature flag
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields?: string[];
  filters?: Record<string, any>;
  dateRange?: DateRange;
}

