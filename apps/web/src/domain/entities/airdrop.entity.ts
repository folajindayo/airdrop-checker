/**
 * Airdrop Entity
 * Core domain entity representing an airdrop campaign
 */

export interface AirdropEntity {
  readonly id: string;
  readonly name: string;
  readonly protocol: string;
  readonly chainId: number;
  readonly status: AirdropStatus;
  readonly eligibilityCriteria: EligibilityCriteria[];
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly totalAllocation?: string;
  readonly claimedAmount?: string;
  readonly metadata: AirdropMetadata;
}

export enum AirdropStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  ENDED = 'ended',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
}

export interface EligibilityCriteria {
  type: CriteriaType;
  requirement: string;
  value: string | number;
  met?: boolean;
}

export enum CriteriaType {
  MIN_BALANCE = 'min_balance',
  MIN_TRANSACTIONS = 'min_transactions',
  PROTOCOL_INTERACTION = 'protocol_interaction',
  NFT_HOLDER = 'nft_holder',
  GOVERNANCE_PARTICIPATION = 'governance_participation',
  LIQUIDITY_PROVISION = 'liquidity_provision',
  STAKING = 'staking',
  CUSTOM = 'custom',
}

export interface AirdropMetadata {
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  documentationUrl?: string;
  claimUrl?: string;
  tags: string[];
  verified: boolean;
  featured: boolean;
}

/**
 * Factory function to create an AirdropEntity with validation
 */
export function createAirdropEntity(data: Partial<AirdropEntity>): AirdropEntity {
  if (!data.id || !data.name || !data.protocol) {
    throw new Error('Missing required airdrop fields');
  }

  return {
    id: data.id,
    name: data.name,
    protocol: data.protocol,
    chainId: data.chainId || 1,
    status: data.status || AirdropStatus.UPCOMING,
    eligibilityCriteria: data.eligibilityCriteria || [],
    startDate: data.startDate || new Date(),
    endDate: data.endDate,
    totalAllocation: data.totalAllocation,
    claimedAmount: data.claimedAmount,
    metadata: {
      description: data.metadata?.description,
      logoUrl: data.metadata?.logoUrl,
      websiteUrl: data.metadata?.websiteUrl,
      twitterUrl: data.metadata?.twitterUrl,
      discordUrl: data.metadata?.discordUrl,
      documentationUrl: data.metadata?.documentationUrl,
      claimUrl: data.metadata?.claimUrl,
      tags: data.metadata?.tags || [],
      verified: data.metadata?.verified || false,
      featured: data.metadata?.featured || false,
    },
  };
}

/**
 * Type guard to check if an object is an AirdropEntity
 */
export function isAirdropEntity(obj: unknown): obj is AirdropEntity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'protocol' in obj
  );
}

