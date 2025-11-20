/**
 * Address Value Object
 * Ensures address validity and provides utility methods
 */

export class Address {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Create an Address from a string
   */
  static create(value: string): Address {
    const normalized = value.trim().toLowerCase();
    
    if (!Address.isValid(normalized)) {
      throw new Error(`Invalid Ethereum address: ${value}`);
    }

    return new Address(normalized);
  }

  /**
   * Validate Ethereum address format
   */
  static isValid(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get the address value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Get checksummed address
   */
  get checksummed(): string {
    return this.toChecksum(this._value);
  }

  /**
   * Get shortened address (0x1234...5678)
   */
  get short(): string {
    return `${this._value.slice(0, 6)}...${this._value.slice(-4)}`;
  }

  /**
   * Check if address equals another
   */
  equals(other: Address | string): boolean {
    const otherValue = typeof other === 'string' ? other : other.value;
    return this._value.toLowerCase() === otherValue.toLowerCase();
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this._value;
  }

  /**
   * Convert address to checksummed format (EIP-55)
   */
  private toChecksum(address: string): string {
    const addr = address.toLowerCase().replace('0x', '');
    const hash = this.keccak256(addr);
    let checksummed = '0x';

    for (let i = 0; i < addr.length; i++) {
      if (parseInt(hash[i], 16) >= 8) {
        checksummed += addr[i].toUpperCase();
      } else {
        checksummed += addr[i];
      }
    }

    return checksummed;
  }

  /**
   * Simple keccak256 hash implementation stub
   * In production, use a proper library like ethers.js or viem
   */
  private keccak256(value: string): string {
    // This is a placeholder - use proper crypto library in production
    return value;
  }
}

/**
 * Type guard for Address
 */
export function isAddress(obj: unknown): obj is Address {
  return obj instanceof Address;
}

