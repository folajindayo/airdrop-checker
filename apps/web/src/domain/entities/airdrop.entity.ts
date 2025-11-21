/**
 * Airdrop Entity - Core Domain Model
 * Represents an airdrop with its essential properties and business rules
 */

export interface AirdropEntityProps {
  id: string;
  name: string;
  symbol: string;
  totalAmount: bigint;
  claimAmount: bigint;
  startDate: Date;
  endDate: Date;
  chainId: number;
  contractAddress: string;
  status: AirdropStatus;
  eligibilityCriteria: EligibilityCriteria[];
  metadata?: AirdropMetadata;
}

export enum AirdropStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  ENDED = 'ended',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
}

export interface EligibilityCriteria {
  type: 'balance' | 'transaction' | 'nft' | 'vote' | 'custom';
  requirement: string;
  value: string | number;
  met?: boolean;
}

export interface AirdropMetadata {
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  logoUrl?: string;
  requirements?: string[];
  distributionType?: 'merkle' | 'linear' | 'vesting';
}

export class AirdropEntity {
  private constructor(private readonly props: AirdropEntityProps) {}

  static create(props: AirdropEntityProps): AirdropEntity {
    this.validate(props);
    return new AirdropEntity(props);
  }

  private static validate(props: AirdropEntityProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Airdrop ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Airdrop name is required');
    }

    if (props.totalAmount <= 0n) {
      throw new Error('Total amount must be greater than 0');
    }

    if (props.claimAmount < 0n) {
      throw new Error('Claim amount cannot be negative');
    }

    if (props.claimAmount > props.totalAmount) {
      throw new Error('Claim amount cannot exceed total amount');
    }

    if (props.endDate < props.startDate) {
      throw new Error('End date must be after start date');
    }

    if (!props.contractAddress || !/^0x[a-fA-F0-9]{40}$/.test(props.contractAddress)) {
      throw new Error('Invalid contract address');
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get symbol(): string {
    return this.props.symbol;
  }

  get totalAmount(): bigint {
    return this.props.totalAmount;
  }

  get claimAmount(): bigint {
    return this.props.claimAmount;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get chainId(): number {
    return this.props.chainId;
  }

  get contractAddress(): string {
    return this.props.contractAddress;
  }

  get status(): AirdropStatus {
    return this.props.status;
  }

  get eligibilityCriteria(): EligibilityCriteria[] {
    return [...this.props.eligibilityCriteria];
  }

  get metadata(): AirdropMetadata | undefined {
    return this.props.metadata;
  }

  // Business logic methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.props.status === AirdropStatus.ACTIVE &&
      now >= this.props.startDate &&
      now <= this.props.endDate
    );
  }

  isUpcoming(): boolean {
    return this.props.status === AirdropStatus.UPCOMING && new Date() < this.props.startDate;
  }

  hasEnded(): boolean {
    return this.props.status === AirdropStatus.ENDED || new Date() > this.props.endDate;
  }

  isClaimed(): boolean {
    return this.props.status === AirdropStatus.CLAIMED;
  }

  canClaim(): boolean {
    return this.isActive() && !this.isClaimed() && this.meetsEligibilityCriteria();
  }

  meetsEligibilityCriteria(): boolean {
    if (this.props.eligibilityCriteria.length === 0) {
      return true;
    }
    return this.props.eligibilityCriteria.every((criteria) => criteria.met === true);
  }

  getClaimPercentage(): number {
    if (this.props.totalAmount === 0n) {
      return 0;
    }
    return Number((this.props.claimAmount * 100n) / this.props.totalAmount);
  }

  getRemainingTime(): number {
    if (this.hasEnded()) {
      return 0;
    }
    return this.props.endDate.getTime() - Date.now();
  }

  getRemainingAmount(): bigint {
    return this.props.totalAmount - this.props.claimAmount;
  }

  // State transitions
  markAsClaimed(): AirdropEntity {
    if (!this.canClaim()) {
      throw new Error('Airdrop cannot be claimed in current state');
    }

    return new AirdropEntity({
      ...this.props,
      status: AirdropStatus.CLAIMED,
    });
  }

  activate(): AirdropEntity {
    if (!this.isUpcoming()) {
      throw new Error('Only upcoming airdrops can be activated');
    }

    return new AirdropEntity({
      ...this.props,
      status: AirdropStatus.ACTIVE,
    });
  }

  expire(): AirdropEntity {
    return new AirdropEntity({
      ...this.props,
      status: AirdropStatus.EXPIRED,
    });
  }

  // Serialization
  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      symbol: this.props.symbol,
      totalAmount: this.props.totalAmount.toString(),
      claimAmount: this.props.claimAmount.toString(),
      startDate: this.props.startDate.toISOString(),
      endDate: this.props.endDate.toISOString(),
      chainId: this.props.chainId,
      contractAddress: this.props.contractAddress,
      status: this.props.status,
      eligibilityCriteria: this.props.eligibilityCriteria,
      metadata: this.props.metadata,
      isActive: this.isActive(),
      canClaim: this.canClaim(),
      claimPercentage: this.getClaimPercentage(),
      remainingAmount: this.getRemainingAmount().toString(),
    };
  }
}
