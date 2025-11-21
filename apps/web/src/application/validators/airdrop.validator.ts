/**
 * Airdrop Validators
 */

import { z } from 'zod';

export const createAirdropSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  eligibilityCriteria: z.array(z.string()).min(1),
  rewardAmount: z.string().regex(/^\d+(\.\d+)?$/),
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
});

export const updateAirdropSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  status: z.enum(['upcoming', 'active', 'ended', 'cancelled']).optional(),
  eligibilityCriteria: z.array(z.string()).optional(),
  rewardAmount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const airdropIdSchema = z.string().uuid();

export class AirdropValidator {
  static validateCreate(data: unknown) {
    return createAirdropSchema.parse(data);
  }

  static validateUpdate(data: unknown) {
    return updateAirdropSchema.parse(data);
  }

  static validateId(id: unknown) {
    return airdropIdSchema.parse(id);
  }
}

