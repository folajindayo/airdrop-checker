/**
 * Amount Validator
 */

export class AmountValidator {
  static validate(amount: bigint, min: bigint = 0n): boolean {
    return amount >= min;
  }

  static validateOrThrow(amount: bigint, min: bigint = 0n): void {
    if (!this.validate(amount, min)) {
      throw new Error(`Amount must be at least ${min}`);
    }
  }

  static validatePercentage(value: number): boolean {
    return value >= 0 && value <= 100;
  }

  static isPositive(amount: bigint): boolean {
    return amount > 0n;
  }
}

