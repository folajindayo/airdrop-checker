/**
 * Token Helper Functions
 */

export function formatTokenBalance(balance: string, decimals: number): string {
  const value = BigInt(balance);
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  
  return `${whole}.${fraction.toString().padStart(decimals, '0')}`;
}

export function parseTokenAmount(amount: string, decimals: number): string {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return `${whole}${paddedFraction}`;
}

export function isNativeToken(address: string): boolean {
  return address.toLowerCase() === '0x0000000000000000000000000000000000000000' ||
         address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
}

