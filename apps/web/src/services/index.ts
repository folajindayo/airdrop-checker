/**
 * Services Index
 * Central export point for all application services
 */

// Core services
export * from './airdrop-service';
export * from './portfolio-service';
export * from './transaction-service';
export * from './token-service';
export * from './wallet-service';
export * from './analytics-service';
export * from './blockchain-service';

// Infrastructure services
export * from './goldrush-service';
export * from './cache-service';
export * from './notification-service';
export * from './websocket-service';
export * from './export-service';
export * from './validation-service';

// API client
export * from './api-client';
export * from './api-interceptors';

// Service registry
import { airdropService } from './airdrop-service';
import { portfolioService } from './portfolio-service';
import { transactionService } from './transaction-service';
import { tokenService } from './token-service';
import { walletService } from './wallet-service';
import { analyticsService } from './analytics-service';
import { blockchainService } from './blockchain-service';
import { goldRushService } from './goldrush-service';
import { cacheService } from './cache-service';
import { notificationService } from './notification-service';
import { websocketService } from './websocket-service';
import { exportService } from './export-service';
import { validationService } from './validation-service';
import { apiClient } from './api-client';

export const services = {
  airdrop: airdropService,
  portfolio: portfolioService,
  transaction: transactionService,
  token: tokenService,
  wallet: walletService,
  analytics: analyticsService,
  blockchain: blockchainService,
  goldRush: goldRushService,
  cache: cacheService,
  notification: notificationService,
  websocket: websocketService,
  export: exportService,
  validation: validationService,
  api: apiClient,
};

/**
 * Service initialization
 */
export async function initializeServices(): Promise<void> {
  // Initialize services that need setup
  console.log('[Services] Initializing...');
  
  // Connect WebSocket if needed
  if (process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
    services.websocket.connect();
  }

  console.log('[Services] Initialized successfully');
}

/**
 * Service cleanup
 */
export async function cleanupServices(): Promise<void> {
  console.log('[Services] Cleaning up...');
  
  // Disconnect WebSocket
  services.websocket.disconnect();
  
  // Clear cache
  await services.cache.clear();

  console.log('[Services] Cleaned up successfully');
}

// Initialize on module load (browser only)
if (typeof window !== 'undefined') {
  initializeServices().catch(console.error);
  
  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    cleanupServices().catch(console.error);
  });
}

