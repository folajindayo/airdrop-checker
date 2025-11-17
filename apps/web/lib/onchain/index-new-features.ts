/**
 * Main index file for latest onchain features (768-797)
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

export const FEATURES_768_797 = {
  COUNT: 30,
  RANGE: '768-797',
  CATEGORIES: [
    'Market Analytics',
    'Liquidity & Supply',
    'Holder Analysis',
    'Governance & Derivatives',
    'Validator & MEV',
    'Fees & Batching',
  ],
} as const;

