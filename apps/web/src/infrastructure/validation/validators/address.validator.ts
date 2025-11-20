/**
 * Address Validator
 * Ethereum address validation utilities
 */

export class AddressValidator {
  /**
   * Validate Ethereum address format
   */
  static isValid(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Normalize address to lowercase
   */
  static normalize(address: string): string {
    return address.toLowerCase();
  }

  /**
   * Validate and normalize address
   */
  static validateAndNormalize(address: string): string {
    if (!this.isValid(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }
    return this.normalize(address);
  }

  /**
   * Check if address is zero address
   */
  static isZeroAddress(address: string): boolean {
    return address === '0x0000000000000000000000000000000000000000';
  }

  /**
   * Validate address is not zero address
   */
  static validateNotZero(address: string): void {
    if (this.isZeroAddress(address)) {
      throw new Error('Address cannot be zero address');
    }
  }

  /**
   * Validate array of addresses
   */
  static validateArray(addresses: string[]): string[] {
    return addresses.map((addr) => this.validateAndNormalize(addr));
  }

  /**
   * Check address equality (case-insensitive)
   */
  static areEqual(addr1: string, addr2: string): boolean {
    return this.normalize(addr1) === this.normalize(addr2);
  }
}

