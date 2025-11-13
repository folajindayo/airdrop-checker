/**
 * Validation schemas for Ethereum addresses
 * Uses Zod for runtime type checking and validation
 */

import { z } from 'zod';

/**
 * Ethereum address regex pattern
 * Matches 0x followed by 40 hexadecimal characters
 */
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Schema for validating a single Ethereum address
 * 
 * @example
 * ```typescript
 * const result = addressSchema.parse('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * ```
 */
export const addressSchema = z
  .string()
  .regex(ETH_ADDRESS_REGEX, {
    message: 'Invalid Ethereum address format. Must be 0x followed by 40 hexadecimal characters.',
  })
  .transform((addr) => addr.toLowerCase());

/**
 * Schema for validating multiple Ethereum addresses
 * Allows 2-10 addresses in an array
 * 
 * @example
 * ```typescript
 * const result = addressArraySchema.parse(['0x...', '0x...']);
 * ```
 */
export const addressArraySchema = z
  .array(addressSchema)
  .min(2, 'At least 2 addresses are required')
  .max(10, 'Maximum 10 addresses allowed');

/**
 * Schema for validating address with optional ENS name
 * 
 * @example
 * ```typescript
 * const result = addressOrENSSchema.parse('vitalik.eth');
 * ```
 */
export const addressOrENSSchema = z
  .string()
  .refine(
    (val) => {
      // Check if it's a valid address or ENS name
      return ETH_ADDRESS_REGEX.test(val) || val.endsWith('.eth');
    },
    {
      message: 'Must be a valid Ethereum address or ENS name',
    }
  );

/**
 * Schema for address route parameters
 * Used in Next.js API routes with [address] parameter
 */
export const addressParamsSchema = z.object({
  address: addressSchema,
});

/**
 * Schema for wallet comparison request
 * Validates array of addresses for comparison
 */
export const compareWalletsSchema = z.object({
  addresses: addressArraySchema,
  includeHistory: z.boolean().optional().default(false),
});

/**
 * Type exports for TypeScript type inference
 */
export type Address = z.infer<typeof addressSchema>;
export type AddressArray = z.infer<typeof addressArraySchema>;
export type AddressOrENS = z.infer<typeof addressOrENSSchema>;
export type AddressParams = z.infer<typeof addressParamsSchema>;
export type CompareWalletsInput = z.infer<typeof compareWalletsSchema>;

/**
 * Helper function to validate and normalize an address
 * 
 * @param address - Address to validate
 * @returns Validated and normalized address
 * @throws ZodError if validation fails
 * 
 * @example
 * ```typescript
 * const addr = validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * // Returns: '0x742d35cc6634c0532925a3b844bc9e7595f0beb'
 * ```
 */
export function validateAddress(address: string): Address {
  return addressSchema.parse(address);
}

/**
 * Helper function to safely validate an address
 * Returns null instead of throwing on validation failure
 * 
 * @param address - Address to validate
 * @returns Validated address or null if invalid
 * 
 * @example
 * ```typescript
 * const addr = safeValidateAddress('invalid');
 * // Returns: null
 * ```
 */
export function safeValidateAddress(address: string): Address | null {
  const result = addressSchema.safeParse(address);
  return result.success ? result.data : null;
}

/**
 * Helper function to check if a string is a valid address
 * 
 * @param address - String to check
 * @returns True if valid address, false otherwise
 * 
 * @example
 * ```typescript
 * if (isValidAddress('0x...')) {
 *   // Process address
 * }
 * ```
 */
export function isValidAddress(address: string): boolean {
  return addressSchema.safeParse(address).success;
}

