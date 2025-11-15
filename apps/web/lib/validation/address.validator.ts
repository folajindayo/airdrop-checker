/**
 * Address validation schemas
 */

import { isValidAddress, isValidTxHash } from '@airdrop-finder/shared';

export interface AddressValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

export function validateEthereumAddress(address: string): AddressValidationResult {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }
  
  if (!isValidAddress(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }
  
  return { isValid: true, normalized: address.toLowerCase() };
}

export function validateTransactionHash(txHash: string): AddressValidationResult {
  if (!txHash) {
    return { isValid: false, error: 'Transaction hash is required' };
  }
  
  if (!isValidTxHash(txHash)) {
    return { isValid: false, error: 'Invalid transaction hash format' };
  }
  
  return { isValid: true, normalized: txHash.toLowerCase() };
}

export function validateMultipleAddresses(addresses: string[]): {
  valid: string[];
  invalid: string[];
  errors: Record<string, string>;
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  const errors: Record<string, string> = {};
  
  addresses.forEach((addr) => {
    const result = validateEthereumAddress(addr);
    if (result.isValid && result.normalized) {
      valid.push(result.normalized);
    } else {
      invalid.push(addr);
      errors[addr] = result.error || 'Invalid address';
    }
  });
  
  return { valid, invalid, errors };
}

