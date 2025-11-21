/**
 * Wallet Validation Schemas
 */

import { z } from 'zod';

export const WalletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: 'Invalid Ethereum address',
});

export const ENSNameSchema = z.string().regex(/^[a-z0-9-]+\.eth$/, {
  message: 'Invalid ENS name',
});

export const WalletIdentifierSchema = z.union([
  WalletAddressSchema,
  ENSNameSchema,
]);

export const GetPortfolioSchema = z.object({
  walletAddress: WalletAddressSchema,
  chainId: z.number().int().positive(),
  includeHistory: z.boolean().optional(),
});

export type GetPortfolioInput = z.infer<typeof GetPortfolioSchema>;

