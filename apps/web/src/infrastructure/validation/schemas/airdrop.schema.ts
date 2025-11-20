/**
 * Airdrop Validation Schemas
 * Zod schemas for airdrop data validation
 */

import { z } from 'zod';

export const AirdropStatusSchema = z.enum([
  'upcoming',
  'active',
  'ended',
  'claimed',
  'expired',
]);

export const CriteriaTypeSchema = z.enum([
  'min_balance',
  'min_transactions',
  'protocol_interaction',
  'nft_holder',
  'governance_participation',
  'liquidity_provision',
  'staking',
  'custom',
]);

export const EligibilityCriteriaSchema = z.object({
  type: CriteriaTypeSchema,
  requirement: z.string().min(1),
  value: z.union([z.string(), z.number()]),
  met: z.boolean().optional(),
});

export const AirdropMetadataSchema = z.object({
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  discordUrl: z.string().url().optional(),
  documentationUrl: z.string().url().optional(),
  claimUrl: z.string().url().optional(),
  tags: z.array(z.string()),
  verified: z.boolean(),
  featured: z.boolean(),
});

export const AirdropSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  protocol: z.string().min(1).max(50),
  chainId: z.number().int().positive(),
  status: AirdropStatusSchema,
  eligibilityCriteria: z.array(EligibilityCriteriaSchema),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  totalAllocation: z.string().optional(),
  claimedAmount: z.string().optional(),
  metadata: AirdropMetadataSchema,
});

export const CreateAirdropSchema = AirdropSchema.omit({ id: true });

export const UpdateAirdropSchema = AirdropSchema.partial().required({ id: true });

export const AirdropFiltersSchema = z.object({
  status: z.array(AirdropStatusSchema).optional(),
  chainIds: z.array(z.number().int().positive()).optional(),
  protocols: z.array(z.string()).optional(),
  search: z.string().optional(),
  verified: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  sortBy: z.enum(['startDate', 'endDate', 'name', 'protocol']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AirdropInput = z.infer<typeof AirdropSchema>;
export type CreateAirdropInput = z.infer<typeof CreateAirdropSchema>;
export type UpdateAirdropInput = z.infer<typeof UpdateAirdropSchema>;
export type AirdropFiltersInput = z.infer<typeof AirdropFiltersSchema>;

