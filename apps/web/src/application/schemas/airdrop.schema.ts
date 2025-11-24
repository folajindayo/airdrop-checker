/**
 * Airdrop Validation Schemas
 */

import { z } from 'zod';

export const AirdropSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(10),
  totalAmount: z.string().regex(/^\d+$/),
  claimAmount: z.string().regex(/^\d+$/),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  chainId: z.number().int().positive(),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  status: z.enum(['upcoming', 'active', 'ended', 'claimed', 'expired']),
});

export const CheckEligibilitySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().int().positive(),
  airdropId: z.string().optional(),
});

export const SearchAirdropsSchema = z.object({
  query: z.string().min(2).max(100),
  chainId: z.number().int().positive().optional(),
  status: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type AirdropInput = z.infer<typeof AirdropSchema>;
export type CheckEligibilityInput = z.infer<typeof CheckEligibilitySchema>;
export type SearchAirdropsInput = z.infer<typeof SearchAirdropsSchema>;


