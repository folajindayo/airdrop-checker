/**
 * Contract Utilities
 */

export function parseContractError(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error?.message) {
    const message = error.message;
    
    if (message.includes('user rejected')) {
      return 'Transaction was rejected';
    }
    
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    
    return message;
  }
  
  return 'An unknown error occurred';
}

export function isContractAddress(address: string): boolean {
  return address.startsWith('0x') && address.length === 42;
}

