/**
 * Error handling for onchain features
 * All errors are user-friendly and include Reown Wallet connection guidance
 */

export class OnchainError extends Error {
  constructor(
    message: string,
    public code: string,
    public requiresWallet: boolean = false
  ) {
    super(message);
    this.name = 'OnchainError';
  }
}

export const ONCHAIN_ERRORS = {
  WALLET_NOT_CONNECTED: new OnchainError(
    'Please connect your Reown wallet to continue',
    'WALLET_NOT_CONNECTED',
    true
  ),
  INVALID_ADDRESS: new OnchainError(
    'Invalid Ethereum address provided',
    'INVALID_ADDRESS',
    false
  ),
  INVALID_CHAIN: new OnchainError(
    'Unsupported chain ID',
    'INVALID_CHAIN',
    false
  ),
  TRANSACTION_FAILED: new OnchainError(
    'Transaction failed. Please check your Reown wallet and try again',
    'TRANSACTION_FAILED',
    true
  ),
  INSUFFICIENT_BALANCE: new OnchainError(
    'Insufficient balance for this transaction',
    'INSUFFICIENT_BALANCE',
    false
  ),
  GAS_ESTIMATION_FAILED: new OnchainError(
    'Failed to estimate gas. Transaction may fail',
    'GAS_ESTIMATION_FAILED',
    false
  ),
} as const;

export function handleOnchainError(error: unknown): OnchainError {
  if (error instanceof OnchainError) {
    return error;
  }

  if (error instanceof Error) {
    return new OnchainError(
      error.message,
      'UNKNOWN_ERROR',
      false
    );
  }

  return new OnchainError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    false
  );
}

