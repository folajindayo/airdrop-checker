/**
 * Amount Formatter Utility
 */

export class AmountFormatter {
  static formatToken(amount: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const whole = amount / divisor;
    const fraction = amount % divisor;
    
    if (fraction === 0n) {
      return whole.toString();
    }

    const fractionStr = fraction.toString().padStart(decimals, '0');
    const trimmed = fractionStr.replace(/0+$/, '');
    return `${whole}.${trimmed}`;
  }

  static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  }

  static formatCompact(value: number): string {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }
}


