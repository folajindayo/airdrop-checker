/**
 * Test fixtures and mock data
 * Provides reusable test data for consistent testing
 */

import type { AirdropProject } from '@airdrop-finder/shared';

/**
 * Mock Ethereum address for testing
 */
export const MOCK_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

/**
 * Mock transaction hash
 */
export const MOCK_TX_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

/**
 * Mock airdrop project data
 */
export const MOCK_AIRDROP_PROJECT: AirdropProject = {
  id: 'zora',
  name: 'Zora',
  description: 'Zora is a decentralized media protocol',
  status: 'confirmed',
  snapshotDate: '2024-01-15',
  claimDate: '2024-02-01',
  website: 'https://zora.co',
  twitter: 'https://twitter.com/zora',
  discord: 'https://discord.gg/zora',
  chains: [1, 8453],
  criteria: [
    { type: 'transaction_count', min: 5 },
    { type: 'protocol_interaction', protocols: ['Zora'] },
  ],
  estimatedValue: 1000,
  eligibilityScore: 85,
};

/**
 * Mock airdrop check result
 */
export const MOCK_AIRDROP_CHECK_RESULT = {
  address: MOCK_ADDRESS,
  overallScore: 72,
  airdrops: [
    {
      project: 'Zora',
      projectId: 'zora',
      status: 'confirmed',
      score: 100,
      criteria: [
        { type: 'transaction_count', met: true, value: 10 },
        { type: 'protocol_interaction', met: true, protocols: ['Zora'] },
      ],
    },
  ],
  timestamp: new Date().toISOString(),
};

/**
 * Mock portfolio data
 */
export const MOCK_PORTFOLIO_DATA = {
  address: MOCK_ADDRESS,
  totalValue: 125000,
  chains: [
    {
      chainId: 1,
      chainName: 'Ethereum',
      value: 100000,
      tokens: [
        {
          symbol: 'ETH',
          balance: '10.5',
          value: 25000,
        },
      ],
    },
  ],
  lastUpdated: new Date().toISOString(),
};

/**
 * Mock gas tracker data
 */
export const MOCK_GAS_TRACKER_DATA = {
  address: MOCK_ADDRESS,
  totalSpent: 0.5,
  transactions: 150,
  averageGasPrice: 30,
  chains: [
    {
      chainId: 1,
      chainName: 'Ethereum',
      gasSpent: 0.3,
      transactions: 100,
    },
  ],
};

/**
 * Mock reminder data
 */
export const MOCK_REMINDER = {
  id: 'reminder-1',
  address: MOCK_ADDRESS,
  projectId: 'zora',
  projectName: 'Zora',
  type: 'claim' as const,
  reminderTime: new Date(Date.now() + 86400000).toISOString(),
  message: 'Claim your Zora airdrop',
  enabled: true,
  createdAt: new Date().toISOString(),
  sent: false,
};

/**
 * Mock claim tracker data
 */
export const MOCK_CLAIM = {
  id: 'claim-1',
  address: MOCK_ADDRESS,
  projectId: 'zora',
  projectName: 'Zora',
  status: 'claimed' as const,
  amount: '1000',
  valueUSD: 1000,
  txHash: MOCK_TX_HASH,
  claimedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

