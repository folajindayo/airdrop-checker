/**
 * Airdrop eligibility criteria definitions
 * Standardized criteria for checking airdrop eligibility
 */

export type CriteriaType =
  | 'transaction_count'
  | 'transaction_volume'
  | 'unique_contracts'
  | 'gas_spent'
  | 'holding_duration'
  | 'token_balance'
  | 'nft_ownership'
  | 'liquidity_provision'
  | 'governance_participation'
  | 'bridge_usage'
  | 'snapshot_date';

export interface CriteriaDefinition {
  type: CriteriaType;
  name: string;
  description: string;
  icon: string;
  defaultThreshold?: number;
  unit?: string;
}

/**
 * Standard airdrop criteria definitions
 */
export const AIRDROP_CRITERIA: Record<CriteriaType, CriteriaDefinition> = {
  transaction_count: {
    type: 'transaction_count',
    name: 'Transaction Count',
    description: 'Minimum number of transactions required',
    icon: '🔄',
    defaultThreshold: 10,
    unit: 'transactions',
  },
  
  transaction_volume: {
    type: 'transaction_volume',
    name: 'Transaction Volume',
    description: 'Minimum total transaction volume',
    icon: '💰',
    defaultThreshold: 1000,
    unit: 'USD',
  },
  
  unique_contracts: {
    type: 'unique_contracts',
    name: 'Unique Contracts',
    description: 'Number of unique contracts interacted with',
    icon: '📝',
    defaultThreshold: 5,
    unit: 'contracts',
  },
  
  gas_spent: {
    type: 'gas_spent',
    name: 'Gas Spent',
    description: 'Minimum gas spent on transactions',
    icon: '⛽',
    defaultThreshold: 0.1,
    unit: 'ETH',
  },
  
  holding_duration: {
    type: 'holding_duration',
    name: 'Holding Duration',
    description: 'Minimum token holding period',
    icon: '⏳',
    defaultThreshold: 30,
    unit: 'days',
  },
  
  token_balance: {
    type: 'token_balance',
    name: 'Token Balance',
    description: 'Minimum token balance required',
    icon: '💎',
    defaultThreshold: 100,
    unit: 'tokens',
  },
  
  nft_ownership: {
    type: 'nft_ownership',
    name: 'NFT Ownership',
    description: 'Must own specific NFT(s)',
    icon: '🖼️',
    defaultThreshold: 1,
    unit: 'NFTs',
  },
  
  liquidity_provision: {
    type: 'liquidity_provision',
    name: 'Liquidity Provision',
    description: 'Provided liquidity to pools',
    icon: '💧',
    defaultThreshold: 100,
    unit: 'USD',
  },
  
  governance_participation: {
    type: 'governance_participation',
    name: 'Governance Participation',
    description: 'Participated in governance votes',
    icon: '🗳️',
    defaultThreshold: 1,
    unit: 'votes',
  },
  
  bridge_usage: {
    type: 'bridge_usage',
    name: 'Bridge Usage',
    description: 'Used cross-chain bridges',
    icon: '🌉',
    defaultThreshold: 1,
    unit: 'bridges',
  },
  
  snapshot_date: {
    type: 'snapshot_date',
    name: 'Snapshot Date',
    description: 'Activity before snapshot date',
    icon: '📸',
    unit: 'date',
  },
};

/**
 * Eligibility score levels
 */
export const ELIGIBILITY_LEVELS = {
  NONE: { min: 0, max: 0, label: 'Not Eligible', color: 'gray' },
  LOW: { min: 1, max: 30, label: 'Low Chance', color: 'red' },
  MEDIUM: { min: 31, max: 60, label: 'Medium Chance', color: 'yellow' },
  HIGH: { min: 61, max: 85, label: 'High Chance', color: 'blue' },
  VERY_HIGH: { min: 86, max: 100, label: 'Very High Chance', color: 'green' },
} as const;

/**
 * Get eligibility level from score
 */
export function getEligibilityLevel(score: number) {
  if (score === 0) return ELIGIBILITY_LEVELS.NONE;
  if (score <= 30) return ELIGIBILITY_LEVELS.LOW;
  if (score <= 60) return ELIGIBILITY_LEVELS.MEDIUM;
  if (score <= 85) return ELIGIBILITY_LEVELS.HIGH;
  return ELIGIBILITY_LEVELS.VERY_HIGH;
}

/**
 * Calculate weighted score from criteria
 */
export function calculateWeightedScore(
  criteriaResults: Array<{ met: boolean; weight?: number }>
): number {
  const totalWeight = criteriaResults.reduce(
    (sum, c) => sum + (c.weight || 1),
    0
  );
  
  const metWeight = criteriaResults
    .filter((c) => c.met)
    .reduce((sum, c) => sum + (c.weight || 1), 0);
  
  return Math.round((metWeight / totalWeight) * 100);
}

/**
 * Common airdrop patterns
 */
export const AIRDROP_PATTERNS = {
  EARLY_ADOPTER: {
    name: 'Early Adopter',
    description: 'Rewarding early protocol users',
    criteria: ['transaction_count', 'snapshot_date'],
  },
  
  POWER_USER: {
    name: 'Power User',
    description: 'Rewarding active users',
    criteria: ['transaction_count', 'transaction_volume', 'unique_contracts'],
  },
  
  LIQUIDITY_PROVIDER: {
    name: 'Liquidity Provider',
    description: 'Rewarding liquidity providers',
    criteria: ['liquidity_provision', 'holding_duration'],
  },
  
  GOVERNANCE: {
    name: 'Governance Participant',
    description: 'Rewarding governance participation',
    criteria: ['governance_participation', 'token_balance'],
  },
  
  NFT_HOLDER: {
    name: 'NFT Holder',
    description: 'Rewarding NFT holders',
    criteria: ['nft_ownership', 'holding_duration'],
  },
  
  BRIDGE_USER: {
    name: 'Bridge User',
    description: 'Rewarding cross-chain activity',
    criteria: ['bridge_usage', 'transaction_count'],
  },
} as const;

/**
 * Estimated value ranges
 */
export const VALUE_RANGES = {
  UNKNOWN: { min: 0, max: 0, label: 'Unknown' },
  SMALL: { min: 10, max: 100, label: '$10-$100' },
  MEDIUM: { min: 100, max: 500, label: '$100-$500' },
  LARGE: { min: 500, max: 2000, label: '$500-$2,000' },
  VERY_LARGE: { min: 2000, max: 10000, label: '$2,000-$10,000' },
  MASSIVE: { min: 10000, max: Infinity, label: '$10,000+' },
} as const;

/**
 * Get value range label
 */
export function getValueRangeLabel(minValue: number, maxValue: number): string {
  if (minValue === 0 && maxValue === 0) return VALUE_RANGES.UNKNOWN.label;
  if (maxValue <= 100) return VALUE_RANGES.SMALL.label;
  if (maxValue <= 500) return VALUE_RANGES.MEDIUM.label;
  if (maxValue <= 2000) return VALUE_RANGES.LARGE.label;
  if (maxValue <= 10000) return VALUE_RANGES.VERY_LARGE.label;
  return VALUE_RANGES.MASSIVE.label;
}

