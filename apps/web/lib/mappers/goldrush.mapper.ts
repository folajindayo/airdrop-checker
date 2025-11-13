/**
 * GoldRush data mappers
 */

import type { GoldRushTokenBalance, GoldRushTransaction } from '@airdrop-finder/shared';

export function mapTokenBalance(balance: GoldRushTokenBalance) {
  return {
    address: balance.contract_address,
    name: balance.contract_name,
    symbol: balance.contract_ticker_symbol,
    decimals: balance.contract_decimals,
    balance: balance.balance,
    quote: balance.quote || 0,
    logo: balance.logo_url,
    native: balance.native_token,
  };
}

export function mapTransaction(tx: GoldRushTransaction) {
  return {
    hash: tx.tx_hash,
    from: tx.from_address,
    to: tx.to_address,
    value: tx.value,
    gasSpent: tx.gas_spent,
    timestamp: new Date(tx.block_signed_at).getTime(),
    blockHeight: tx.block_height,
  };
}

