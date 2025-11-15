/**
 * DeFi-related type definitions
 */

export interface DeFiPosition {
  protocol: string;
  type: 'lending' | 'staking' | 'liquidity';
  value: number;
  apr: number;
}

export interface YieldOpportunity {
  protocol: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
}
