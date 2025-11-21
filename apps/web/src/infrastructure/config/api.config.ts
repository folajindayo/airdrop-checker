/**
 * API Configuration
 */

export interface ApiConfig {
  goldrushApiKey: string;
  goldrushBaseUrl: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

export const apiConfig: ApiConfig = {
  goldrushApiKey: process.env.GOLDRUSH_API_KEY || '',
  goldrushBaseUrl: process.env.GOLDRUSH_BASE_URL || 'https://api.covalenthq.com',
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
};

export function validateApiConfig(): void {
  if (!apiConfig.goldrushApiKey) {
    throw new Error('GOLDRUSH_API_KEY is required');
  }
}

