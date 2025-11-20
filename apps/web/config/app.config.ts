/**
 * Application Configuration
 */

export const appConfig = {
  name: 'Airdrop Checker',
  version: '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableNotifications: true,
    enableDarkMode: true,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
  },
};

