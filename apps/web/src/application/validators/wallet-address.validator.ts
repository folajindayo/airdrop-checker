/**
 * Wallet Address Validator
 */

export class WalletAddressValidator {
  static validate(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    const normalized = address.trim().toLowerCase();
    return /^0x[a-f0-9]{40}$/.test(normalized);
  }

  static validateOrThrow(address: string): void {
    if (!this.validate(address)) {
      throw new Error(`Invalid wallet address: ${address}`);
    }
  }

  static normalize(address: string): string {
    this.validateOrThrow(address);
    return address.trim().toLowerCase();
  }
}

