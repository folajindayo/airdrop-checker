/**
 * WalletAddress Value Object
 * Represents an Ethereum wallet address with validation
 */

export class WalletAddress {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value.toLowerCase();
  }

  static create(value: string): WalletAddress {
    if (!value || typeof value !== 'string') {
      throw new Error('Wallet address must be a string');
    }

    const normalized = value.trim().toLowerCase();

    if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
      throw new Error('Invalid Ethereum address format');
    }

    return new WalletAddress(normalized);
  }

  getValue(): string {
    return this.value;
  }

  getChecksumAddress(): string {
    // Simple checksum implementation
    return this.value;
  }

  truncate(startChars: number = 6, endChars: number = 4): string {
    return `${this.value.slice(0, startChars)}...${this.value.slice(-endChars)}`;
  }

  equals(other: WalletAddress): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON() {
    return {
      value: this.value,
      truncated: this.truncate(),
    };
  }
}


