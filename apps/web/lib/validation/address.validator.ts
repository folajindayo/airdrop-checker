/**
 * Address Validator
 */

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidEnsName(name: string): boolean {
  return /^[a-z0-9-]+\.eth$/.test(name);
}

export function validateAddressOrEns(input: string): {
  isValid: boolean;
  type: 'address' | 'ens' | 'invalid';
  error?: string;
} {
  if (isValidAddress(input)) {
    return { isValid: true, type: 'address' };
  }
  
  if (isValidEnsName(input)) {
    return { isValid: true, type: 'ens' };
  }
  
  return {
    isValid: false,
    type: 'invalid',
    error: 'Invalid Ethereum address or ENS name',
  };
}
