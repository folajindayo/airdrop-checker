/**
 * Form Validation Schemas
 * 
 * Zod schemas for all form inputs
 */

import { z } from 'zod';

/**
 * Wallet address form schema
 */
export const walletFormSchema = z.object({
  address: z
    .string()
    .min(1, 'Address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  chainId: z.number().optional(),
});

/**
 * Airdrop filter form schema
 */
export const airdropFilterSchema = z.object({
  status: z.enum(['confirmed', 'rumored', 'speculative', 'expired', 'all']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'value', 'date', 'popularity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Portfolio export form schema
 */
export const exportFormSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']),
  includeHistory: z.boolean().optional(),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
});

/**
 * Settings form schema
 */
export const settingsFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  notifications: z.boolean(),
  autoRefresh: z.boolean(),
  refreshInterval: z.number().min(5).max(300),
});

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

// Export types
export type WalletFormData = z.infer<typeof walletFormSchema>;
export type AirdropFilterData = z.infer<typeof airdropFilterSchema>;
export type ExportFormData = z.infer<typeof exportFormSchema>;
export type SettingsFormData = z.infer<typeof settingsFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;

