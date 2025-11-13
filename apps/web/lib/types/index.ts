/**
 * Application type exports
 */

// Re-export shared types
export * from '@airdrop-finder/shared/types';

// App-specific types
export interface AppMetadata {
  version: string;
  buildTime?: string;
  commitHash?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'GBP';
  notifications: boolean;
  compactMode: boolean;
}

export interface RouteParams {
  address?: string;
  projectId?: string;
  chainId?: string;
}

