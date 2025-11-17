/**
 * Main index file for latest onchain features (798-827)
 * Centralized exports for all new feature utilities
 */

export * from './exports-new-features';
export * from './config-new-features';
export * from './calculators-new-features';
export * from './formatters-new-features';
export * from './filters-new-features';
export * from './aggregators-new-features';
export * from './transformers-new-features';
export * from './mappers-new-features';
export * from './sorters-new-features';

export const FEATURES_798_827 = {
  COUNT: 30,
  RANGE: '798-827',
  CATEGORIES: [
    'Timelock & Governance',
    'Wallet Detection',
    'Contract Analysis',
    'Multisig & Price Feeds',
    'Distribution & Locks',
    'Holder Analytics',
  ],
} as const;

