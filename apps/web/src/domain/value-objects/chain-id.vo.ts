/**
 * ChainId Value Object
 * Represents a blockchain chain ID with validation
 */

export class ChainId {
  private readonly value: number;

  private static readonly SUPPORTED_CHAINS = new Set([
    1, // Ethereum Mainnet
    10, // Optimism
    56, // BSC
    137, // Polygon
    250, // Fantom
    42161, // Arbitrum
    43114, // Avalanche
    8453, // Base
    59144, // Linea
    534352, // Scroll
  ]);

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): ChainId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('Chain ID must be a positive integer');
    }

    return new ChainId(value);
  }

  getValue(): number {
    return this.value;
  }

  isSupported(): boolean {
    return ChainId.SUPPORTED_CHAINS.has(this.value);
  }

  getChainName(): string {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      10: 'Optimism',
      56: 'BNB Smart Chain',
      137: 'Polygon',
      250: 'Fantom',
      42161: 'Arbitrum One',
      43114: 'Avalanche C-Chain',
      8453: 'Base',
      59144: 'Linea',
      534352: 'Scroll',
    };

    return chainNames[this.value] || `Chain ${this.value}`;
  }

  equals(other: ChainId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }

  toJSON() {
    return {
      value: this.value,
      name: this.getChainName(),
      isSupported: this.isSupported(),
    };
  }
}
