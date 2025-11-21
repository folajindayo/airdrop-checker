/**
 * Percentage Utility
 */

export class PercentageUtil {
  static calculate(part: number, total: number): number {
    if (total === 0) return 0;
    return (part / total) * 100;
  }

  static format(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }

  static fromDecimal(decimal: number): number {
    return decimal * 100;
  }

  static toDecimal(percentage: number): number {
    return percentage / 100;
  }
}

