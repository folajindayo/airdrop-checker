/**
 * Zod validation schemas
 */

import { z } from "zod";

// Ethereum address schema
export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

// Airdrop status schema
export const airdropStatusSchema = z.enum(["active", "upcoming", "ended", "claimed"]);

// Chain schema
export const chainSchema = z.enum([
  "ethereum",
  "polygon",
  "bsc",
  "arbitrum",
  "optimism",
  "avalanche",
  "base",
  "solana",
]);

// Airdrop filters schema
export const airdropFiltersSchema = z.object({
  status: z.array(airdropStatusSchema).optional(),
  chain: z.array(chainSchema).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type AirdropFilters = z.infer<typeof airdropFiltersSchema>;

// Airdrop creation schema
export const createAirdropSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  chain: chainSchema,
  status: airdropStatusSchema,
  totalAmount: z.string().min(1),
  participants: z.number().int().min(0),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  requirements: z.array(z.string()).min(1),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
});

export type CreateAirdropInput = z.infer<typeof createAirdropSchema>;

// Eligibility check schema
export const eligibilityCheckSchema = z.object({
  address: addressSchema,
  airdropId: z.string().uuid(),
});

export type EligibilityCheckInput = z.infer<typeof eligibilityCheckSchema>;

// Wallet connection schema
export const walletConnectionSchema = z.object({
  address: addressSchema,
  chainId: z.number().int().positive(),
  signature: z.string().optional(),
});

export type WalletConnectionInput = z.infer<typeof walletConnectionSchema>;

// Notification schema
export const notificationSchema = z.object({
  type: z.enum(["success", "error", "warning", "info"]),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  data: z.record(z.any()).optional(),
});

export type NotificationInput = z.infer<typeof notificationSchema>;

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Sort schema
export const sortSchema = z.object({
  sortBy: z.enum(["date", "amount", "participants", "name"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type SortInput = z.infer<typeof sortSchema>;

// Query schema
export const querySchema = paginationSchema.merge(sortSchema).merge(airdropFiltersSchema);

export type QueryInput = z.infer<typeof querySchema>;

// Favorite schema
export const favoriteSchema = z.object({
  userId: z.string(),
  airdropId: z.string().uuid(),
});

export type FavoriteInput = z.infer<typeof favoriteSchema>;

