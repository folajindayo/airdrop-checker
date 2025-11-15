/**
 * Validation schemas for API request/response structures
 * Provides comprehensive validation for all API endpoints
 */

import { z } from 'zod';
import { addressSchema } from './address.schema';

/**
 * Airdrop status enum
 */
export const airdropStatusSchema = z.enum(['confirmed', 'rumored', 'speculative', 'expired']);

/**
 * Chain ID validation
 * Supports common EVM chains
 */
export const chainIdSchema = z.number().int().positive();

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Date range validation
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after or equal to start date',
  }
);

/**
 * Schema for /api/airdrops query parameters
 */
export const airdropsQuerySchema = z.object({
  status: airdropStatusSchema.optional(),
  chainId: chainIdSchema.optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Schema for /api/portfolio/[address] query parameters
 */
export const portfolioQuerySchema = z.object({
  chains: z.array(chainIdSchema).optional(),
  includeZeroBalances: z.coerce.boolean().default(false),
  includeNFTs: z.coerce.boolean().default(false),
});

/**
 * Schema for /api/compare request body
 */
export const compareWalletsRequestSchema = z.object({
  addresses: z.array(addressSchema).min(2).max(5),
  metrics: z.array(z.string()).optional(),
});

/**
 * Schema for /api/refresh request body
 */
export const refreshRequestSchema = z.object({
  address: addressSchema,
  force: z.boolean().optional().default(false),
});

/**
 * Schema for /api/gas-tracker/[address] query parameters
 */
export const gasTrackerQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year', 'all']).default('month'),
  chainId: chainIdSchema.optional(),
});

/**
 * Schema for /api/calendar query parameters
 */
export const calendarQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: airdropStatusSchema.optional(),
  type: z.enum(['snapshot', 'claim', 'announcement', 'all']).default('all'),
});

/**
 * Schema for /api/search query parameters
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['projects', 'wallets', 'all']).default('all'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * Schema for /api/notifications request body
 */
export const notificationPreferencesSchema = z.object({
  email: z.string().email().optional(),
  discordWebhook: z.string().url().optional(),
  telegramChatId: z.string().optional(),
  preferences: z.object({
    newAirdrops: z.boolean().default(true),
    snapshotAlerts: z.boolean().default(true),
    claimReminders: z.boolean().default(true),
    priceAlerts: z.boolean().default(false),
  }),
});

/**
 * Schema for /api/export/[address] query parameters
 */
export const exportQuerySchema = z.object({
  format: z.enum(['json', 'csv', 'txt', 'pdf', 'excel']).default('json'),
  includeHistory: z.coerce.boolean().default(false),
  includeTransactions: z.coerce.boolean().default(false),
});

/**
 * Schema for /api/roi request body
 */
export const roiCalculatorSchema = z.object({
  address: addressSchema.optional(),
  initialInvestment: z.number().positive(),
  chains: z.array(chainIdSchema).optional(),
  includeAirdrops: z.boolean().default(true),
  includeStaking: z.boolean().default(true),
  includeLiquidity: z.boolean().default(true),
});

/**
 * Schema for /api/simulate request body
 */
export const simulateRequestSchema = z.object({
  address: addressSchema,
  actions: z.array(z.object({
    type: z.enum(['swap', 'stake', 'provide_liquidity', 'nft_mint', 'bridge']),
    chainId: chainIdSchema,
    params: z.record(z.any()),
  })).min(1).max(10),
});

/**
 * Schema for /api/leaderboard query parameters
 */
export const leaderboardQuerySchema = z.object({
  metric: z.enum(['overall_score', 'total_value', 'chain_count', 'transaction_count']).default('overall_score'),
  period: z.enum(['day', 'week', 'month', 'all']).default('all'),
  ...paginationSchema.shape,
});

/**
 * Schema for /api/insights/[address] query parameters
 */
export const insightsQuerySchema = z.object({
  includeRecommendations: z.coerce.boolean().default(true),
  includeRiskAnalysis: z.coerce.boolean().default(true),
  includeTrends: z.coerce.boolean().default(true),
});

/**
 * Type exports
 */
export type AirdropStatus = z.infer<typeof airdropStatusSchema>;
export type ChainId = z.infer<typeof chainIdSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type AirdropsQuery = z.infer<typeof airdropsQuerySchema>;
export type PortfolioQuery = z.infer<typeof portfolioQuerySchema>;
export type CompareWalletsRequest = z.infer<typeof compareWalletsRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type GasTrackerQuery = z.infer<typeof gasTrackerQuerySchema>;
export type CalendarQuery = z.infer<typeof calendarQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type ExportQuery = z.infer<typeof exportQuerySchema>;
export type ROICalculatorInput = z.infer<typeof roiCalculatorSchema>;
export type SimulateRequest = z.infer<typeof simulateRequestSchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
export type InsightsQuery = z.infer<typeof insightsQuerySchema>;

