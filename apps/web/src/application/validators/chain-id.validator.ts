/**
 * Chain ID Validator
 */

export class ChainIdValidator {
  private static readonly SUPPORTED_CHAINS = new Set([
    1, 10, 56, 137, 250, 42161, 43114, 8453, 59144, 534352,
  ]);

  static validate(chainId: number): boolean {
    return Number.isInteger(chainId) && chainId > 0;
  }

  static validateOrThrow(chainId: number): void {
    if (!this.validate(chainId)) {
      throw new Error(`Invalid chain ID: ${chainId}`);
    }
  }

  static isSupported(chainId: number): boolean {
    return this.SUPPORTED_CHAINS.has(chainId);
  }

  static getSupportedChains(): number[] {
    return Array.from(this.SUPPORTED_CHAINS);
  }
}


