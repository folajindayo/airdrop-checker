/**
 * Error handling for new onchain features (738-767)
 * Provides consistent error responses for Reown Wallet operations
 */

export class OnchainFeatureError extends Error {
  constructor(
    message: string,
    public feature: string,
    public code: string
  ) {
    super(message);
    this.name = 'OnchainFeatureError';
  }
}

export function handleOnchainError(error: unknown, feature: string): {
  error: string;
  feature: string;
  code: string;
} {
  if (error instanceof OnchainFeatureError) {
    return {
      error: error.message,
      feature: error.feature,
      code: error.code,
    };
  }

  return {
    error: error instanceof Error ? error.message : 'Unknown error occurred',
    feature,
    code: 'UNKNOWN_ERROR',
  };
}

export const ERROR_CODES = {
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_CHAIN_ID: 'INVALID_CHAIN_ID',
  MISSING_PARAMETER: 'MISSING_PARAMETER',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_MARKET_CAP: 'INVALID_MARKET_CAP',
  INVALID_VOLUME: 'INVALID_VOLUME',
  INVALID_PRICE: 'INVALID_PRICE',
  INVALID_SUPPLY: 'INVALID_SUPPLY',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  INVALID_BLOCK_NUMBER: 'INVALID_BLOCK_NUMBER',
  INVALID_BYTECODE: 'INVALID_BYTECODE',
  INVALID_FUNCTION_SIGNATURE: 'INVALID_FUNCTION_SIGNATURE',
  INVALID_TIMELOCK_DELAY: 'INVALID_TIMELOCK_DELAY',
  INVALID_MULTISIG_THRESHOLD: 'INVALID_MULTISIG_THRESHOLD',
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
} as const;

