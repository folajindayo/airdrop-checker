/**
 * Type definitions for GoldRush (Covalent) API responses
 * Based on GoldRush API v1 specification
 */

/**
 * Base GoldRush API response
 */
export interface GoldRushResponse<T> {
  data: T;
  error: boolean;
  error_message: string | null;
  error_code: number | null;
}

/**
 * Transaction item from GoldRush API
 */
export interface GoldRushTransaction {
  block_signed_at: string;
  block_height: number;
  tx_hash: string;
  tx_offset: number;
  successful: boolean;
  from_address: string;
  from_address_label: string | null;
  to_address: string;
  to_address_label: string | null;
  value: string;
  value_quote: number;
  gas_offered: number;
  gas_spent: number;
  gas_price: number;
  fees_paid: string;
  gas_quote: number;
  gas_quote_rate: number;
  log_events?: GoldRushLogEvent[];
}

/**
 * Transaction list response
 */
export interface GoldRushTransactionsResponse {
  address: string;
  updated_at: string;
  next_update_at: string;
  quote_currency: string;
  chain_id: number;
  chain_name: string;
  items: GoldRushTransaction[];
  pagination: GoldRushPagination | null;
}

/**
 * Log event from transaction
 */
export interface GoldRushLogEvent {
  block_signed_at: string;
  block_height: number;
  tx_offset: number;
  log_offset: number;
  tx_hash: string;
  raw_log_topics: string[];
  sender_contract_decimals: number;
  sender_name: string | null;
  sender_contract_ticker_symbol: string | null;
  sender_address: string;
  sender_address_label: string | null;
  sender_logo_url: string | null;
  raw_log_data: string;
  decoded?: GoldRushDecodedEvent;
}

/**
 * Decoded event data
 */
export interface GoldRushDecodedEvent {
  name: string;
  signature: string;
  params: GoldRushEventParam[];
}

/**
 * Event parameter
 */
export interface GoldRushEventParam {
  name: string;
  type: string;
  indexed: boolean;
  decoded: boolean;
  value: any;
}

/**
 * Token balance item
 */
export interface GoldRushTokenBalance {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: string[] | null;
  logo_url: string | null;
  last_transferred_at: string | null;
  native_token: boolean;
  type: string;
  balance: string;
  balance_24h: string | null;
  quote_rate: number | null;
  quote_rate_24h: number | null;
  quote: number | null;
  quote_24h: number | null;
  nft_data?: GoldRushNFTData[];
}

/**
 * Token balances response
 */
export interface GoldRushTokenBalancesResponse {
  address: string;
  updated_at: string;
  next_update_at: string;
  quote_currency: string;
  chain_id: number;
  chain_name: string;
  items: GoldRushTokenBalance[];
  pagination: GoldRushPagination | null;
}

/**
 * NFT data
 */
export interface GoldRushNFTData {
  token_id: string;
  token_balance: string;
  token_url: string | null;
  supports_erc: string[] | null;
  token_price_wei: string | null;
  token_quote_rate_eth: number | null;
  original_owner: string | null;
  external_data: GoldRushNFTExternalData | null;
  owner: string | null;
  owner_address: string | null;
  burned: boolean | null;
}

/**
 * NFT external metadata
 */
export interface GoldRushNFTExternalData {
  name: string | null;
  description: string | null;
  image: string | null;
  image_256: string | null;
  image_512: string | null;
  image_1024: string | null;
  animation_url: string | null;
  external_url: string | null;
  attributes: GoldRushNFTAttribute[] | null;
  owner: string | null;
}

/**
 * NFT attribute
 */
export interface GoldRushNFTAttribute {
  trait_type: string;
  value: any;
  display_type?: string;
}

/**
 * Pagination info
 */
export interface GoldRushPagination {
  has_more: boolean;
  page_number: number;
  page_size: number;
  total_count: number | null;
}

/**
 * Portfolio value response
 */
export interface GoldRushPortfolioResponse {
  address: string;
  updated_at: string;
  next_update_at: string;
  quote_currency: string;
  chain_id: number;
  chain_name: string;
  total_quote: number;
  items: GoldRushTokenBalance[];
}

/**
 * Historical portfolio response
 */
export interface GoldRushHistoricalPortfolio {
  address: string;
  updated_at: string;
  quote_currency: string;
  chain_id: number;
  chain_name: string;
  items: GoldRushPortfolioItem[];
  pagination: GoldRushPagination | null;
}

/**
 * Portfolio item with historical data
 */
export interface GoldRushPortfolioItem {
  timestamp: string;
  quote: number;
  holdings: GoldRushHolding[];
}

/**
 * Token holding
 */
export interface GoldRushHolding {
  contract_address: string;
  contract_ticker_symbol: string;
  contract_decimals: number;
  balance: string;
  quote: number;
  quote_rate: number;
}

/**
 * Gas prices response
 */
export interface GoldRushGasPrices {
  chain_id: number;
  chain_name: string;
  updated_at: string;
  items: GoldRushGasPrice[];
}

/**
 * Gas price item
 */
export interface GoldRushGasPrice {
  type: 'erc20' | 'nativetokens' | 'uniswapv3';
  gas_price: number;
  base_fee: number;
  max_priority_fee: number;
  max_fee: number;
  confidence: number;
}

