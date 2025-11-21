/**
 * Wallet Entity - Core Domain Model
 * Represents a wallet with its portfolio and eligibility status
 */

export interface WalletEntityProps {
  address: string;
  ens?: string;
  chainId: number;
  balance: bigint;
  tokenBalances: TokenBalance[];
  nftCount: number;
  transactionCount: number;
  firstTransactionDate?: Date;
  lastActivityDate: Date;
  eligibilityScore: number;
  tags: string[];
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  balance: bigint;
  decimals: number;
  value: number;
}

export class WalletEntity {
  private constructor(private readonly props: WalletEntityProps) {}

  static create(props: WalletEntityProps): WalletEntity {
    this.validate(props);
    return new WalletEntity(props);
  }

  private static validate(props: WalletEntityProps): void {
    if (!props.address || !/^0x[a-fA-F0-9]{40}$/.test(props.address)) {
      throw new Error('Invalid wallet address');
    }

    if (props.balance < 0n) {
      throw new Error('Balance cannot be negative');
    }

    if (props.eligibilityScore < 0 || props.eligibilityScore > 100) {
      throw new Error('Eligibility score must be between 0 and 100');
    }

    if (props.nftCount < 0) {
      throw new Error('NFT count cannot be negative');
    }

    if (props.transactionCount < 0) {
      throw new Error('Transaction count cannot be negative');
    }
  }

  // Getters
  get address(): string {
    return this.props.address;
  }

  get ens(): string | undefined {
    return this.props.ens;
  }

  get chainId(): number {
    return this.props.chainId;
  }

  get balance(): bigint {
    return this.props.balance;
  }

  get tokenBalances(): TokenBalance[] {
    return [...this.props.tokenBalances];
  }

  get nftCount(): number {
    return this.props.nftCount;
  }

  get transactionCount(): number {
    return this.props.transactionCount;
  }

  get eligibilityScore(): number {
    return this.props.eligibilityScore;
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get lastActivityDate(): Date {
    return this.props.lastActivityDate;
  }

  // Business logic
  getDisplayName(): string {
    return this.props.ens || this.truncateAddress();
  }

  truncateAddress(): string {
    return `${this.props.address.slice(0, 6)}...${this.props.address.slice(-4)}`;
  }

  getTotalPortfolioValue(): number {
    return this.props.tokenBalances.reduce((total, token) => total + token.value, 0);
  }

  hasToken(contractAddress: string): boolean {
    return this.props.tokenBalances.some(
      (token) => token.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    );
  }

  getTokenBalance(contractAddress: string): TokenBalance | undefined {
    return this.props.tokenBalances.find(
      (token) => token.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    );
  }

  isActiveWallet(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.props.lastActivityDate >= thirtyDaysAgo;
  }

  isWhale(): boolean {
    const whaleThreshold = 1000000; // $1M
    return this.getTotalPortfolioValue() >= whaleThreshold;
  }

  hasHighEligibility(): boolean {
    return this.props.eligibilityScore >= 70;
  }

  getWalletAge(): number {
    if (!this.props.firstTransactionDate) {
      return 0;
    }
    return Date.now() - this.props.firstTransactionDate.getTime();
  }

  getWalletAgeDays(): number {
    return Math.floor(this.getWalletAge() / (1000 * 60 * 60 * 24));
  }

  addTag(tag: string): WalletEntity {
    if (this.props.tags.includes(tag)) {
      return this;
    }

    return new WalletEntity({
      ...this.props,
      tags: [...this.props.tags, tag],
    });
  }

  removeTag(tag: string): WalletEntity {
    return new WalletEntity({
      ...this.props,
      tags: this.props.tags.filter((t) => t !== tag),
    });
  }

  updateBalance(newBalance: bigint): WalletEntity {
    if (newBalance < 0n) {
      throw new Error('Balance cannot be negative');
    }

    return new WalletEntity({
      ...this.props,
      balance: newBalance,
      lastActivityDate: new Date(),
    });
  }

  toJSON() {
    return {
      address: this.props.address,
      ens: this.props.ens,
      displayName: this.getDisplayName(),
      chainId: this.props.chainId,
      balance: this.props.balance.toString(),
      tokenBalances: this.props.tokenBalances.map((token) => ({
        ...token,
        balance: token.balance.toString(),
      })),
      nftCount: this.props.nftCount,
      transactionCount: this.props.transactionCount,
      firstTransactionDate: this.props.firstTransactionDate?.toISOString(),
      lastActivityDate: this.props.lastActivityDate.toISOString(),
      eligibilityScore: this.props.eligibilityScore,
      tags: this.props.tags,
      portfolioValue: this.getTotalPortfolioValue(),
      isActive: this.isActiveWallet(),
      isWhale: this.isWhale(),
      walletAgeDays: this.getWalletAgeDays(),
    };
  }
}
