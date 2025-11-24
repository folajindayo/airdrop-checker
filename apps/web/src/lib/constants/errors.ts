/**
 * Error Constants
 */

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INVALID_ADDRESS: 'Invalid wallet address',
  NETWORK_ERROR: 'Network error occurred. Please try again',
  TRANSACTION_FAILED: 'Transaction failed',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  USER_REJECTED: 'User rejected the transaction',
  API_ERROR: 'API request failed',
  NOT_FOUND: 'Resource not found',
};

export const ERROR_CODES = {
  USER_REJECTED_TX: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
};

