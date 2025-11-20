/**
 * Wallet Validation Schemas
 * Zod schemas for wallet data validation
 */

import { z } from 'zod';

export const EthereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

export const ChainIdSchema = z.number().int().positive();

export const TokenBalanceSchema = z.object({
  address: EthereumAddressSchema,
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  decimals: z.number().int().nonnegative().max(18),
  balance: z.string(),
  balanceFormatted: z.string(),
  valueUSD: z.number().nonnegative(),
  logoUrl: z.string().url().optional(),
});

export const NFTBalanceSchema = z.object({
  contractAddress: EthereumAddressSchema,
  collectionName: z.string(),
  tokenId: z.string(),
  tokenURI: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const WalletBalanceSchema = z.object({
  native: z.string(),
  tokens: z.array(TokenBalanceSchema),
  nfts: z.array(NFTBalanceSchema),
  totalValueUSD: z.number().nonnegative(),
});

export const TransactionSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  incoming: z.number().int().nonnegative(),
  outgoing: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  firstTransaction: z.coerce.date().optional(),
  lastTransaction: z.coerce.date().optional(),
  mostActiveProtocol: z.string().optional(),
});

export const WalletSchema = z.object({
  address: EthereumAddressSchema,
  chainId: ChainIdSchema,
  ensName: z.string().optional(),
  balance: WalletBalanceSchema,
  transactions: TransactionSummarySchema,
  eligibilityScore: z.number().min(0).max(100),
  connectedAt: z.coerce.date(),
  lastUpdated: z.coerce.date(),
});

export const ConnectWalletSchema = z.object({
  address: EthereumAddressSchema,
  chainId: ChainIdSchema,
});

export type WalletInput = z.infer<typeof WalletSchema>;
export type ConnectWalletInput = z.infer<typeof ConnectWalletSchema>;

