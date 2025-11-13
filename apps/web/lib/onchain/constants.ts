/**
 * Onchain feature constants
 * All features use Reown Wallet for secure wallet connections
 */

export const ONCHAIN_FEATURES = {
  TRANSFER: 'token-transfer',
  APPROVAL: 'token-approval',
  NFT_MINT: 'nft-mint',
  STAKE: 'stake',
  UNSTAKE: 'unstake',
  BRIDGE: 'bridge',
  SWAP: 'swap',
  ADD_LIQUIDITY: 'add-liquidity',
  REMOVE_LIQUIDITY: 'remove-liquidity',
  CLAIM_REWARDS: 'claim-rewards',
  VOTE: 'vote',
  DELEGATE: 'delegate',
  WRAP_UNWRAP: 'wrap-unwrap',
  SET_ENS: 'set-ens',
  BATCH: 'batch-transaction',
  CANCEL_TX: 'cancel-transaction',
  SPEED_UP_TX: 'speed-up-transaction',
  SIGN_MESSAGE: 'sign-message',
  SIGN_TYPED_DATA: 'sign-typed-data',
  MULTISIG: 'multisig',
  BALANCE: 'token-balance',
  TX_HISTORY: 'transaction-history',
  GAS_ESTIMATE: 'gas-estimation',
  TOKEN_METADATA: 'token-metadata',
  NFT_BALANCE: 'nft-balance',
  NFT_TRANSFER: 'nft-transfer',
  NFT_APPROVAL: 'nft-approval',
  LP_POSITION: 'lp-position',
  STAKING_POSITION: 'staking-position',
  TOKEN_PRICE: 'token-price',
  CONTRACT_READ: 'contract-read',
  EVENT_LISTENING: 'event-listening',
  TOKEN_ALLOWANCE: 'token-allowance',
  NONCE: 'nonce',
  GAS_PRICE: 'gas-price',
  BLOCK_NUMBER: 'block-number',
  TX_STATUS: 'transaction-status',
  CONTRACT_VERIFICATION: 'contract-verification',
  TOKEN_LIST: 'token-list',
  CHAIN_STATE: 'chain-state',
} as const;

export const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  BASE: 8453,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  POLYGON: 137,
  ZKSYNC: 324,
} as const;

export const REOWN_WALLET_REQUIRED = 'All onchain features require Reown Wallet connection';

