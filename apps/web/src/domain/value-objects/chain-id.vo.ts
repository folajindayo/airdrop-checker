/**
 * ChainId Value Object
 * Represents a blockchain network identifier
 */

export class ChainId {
  private readonly _value: number;
  private readonly _name: string;

  private static readonly SUPPORTED_CHAINS: Record<number, string> = {
    1: 'Ethereum',
    5: 'Goerli',
    56: 'BNB Chain',
    137: 'Polygon',
    42161: 'Arbitrum',
    10: 'Optimism',
    43114: 'Avalanche',
    250: 'Fantom',
    8453: 'Base',
    324: 'zkSync Era',
    59144: 'Linea',
    534352: 'Scroll',
  };

  private constructor(value: number) {
    if (!ChainId.isSupported(value)) {
      throw new Error(`Unsupported chain ID: ${value}`);
    }
    this._value = value;
    this._name = ChainId.SUPPORTED_CHAINS[value];
  }

  /**
   * Create ChainId from number
   */
  static create(value: number): ChainId {
    return new ChainId(value);
  }

  /**
   * Check if chain ID is supported
   */
  static isSupported(chainId: number): boolean {
    return chainId in ChainId.SUPPORTED_CHAINS;
  }

  /**
   * Get all supported chain IDs
   */
  static getSupportedChains(): number[] {
    return Object.keys(ChainId.SUPPORTED_CHAINS).map(Number);
  }

  /**
   * Get chain name from ID
   */
  static getChainName(chainId: number): string | undefined {
    return ChainId.SUPPORTED_CHAINS[chainId];
  }

  /**
   * Get the chain ID value
   */
  get value(): number {
    return this._value;
  }

  /**
   * Get the chain name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Check if mainnet
   */
  get isMainnet(): boolean {
    return this._value === 1;
  }

  /**
   * Check if testnet
   */
  get isTestnet(): boolean {
    return [5, 80001, 97, 421613, 420, 43113, 4002].includes(this._value);
  }

  /**
   * Check equality
   */
  equals(other: ChainId | number): boolean {
    const otherValue = typeof other === 'number' ? other : other.value;
    return this._value === otherValue;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `${this._name} (${this._value})`;
  }

  /**
   * Convert to number
   */
  toNumber(): number {
    return this._value;
  }
}

