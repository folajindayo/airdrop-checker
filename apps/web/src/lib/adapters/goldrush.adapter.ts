/**
 * GoldRush API adapter
 * Transforms GoldRush responses to internal format
 */

import type { GoldRushTokenBalancesResponse, GoldRushTransactionsResponse } from '@airdrop-finder/shared';

export class GoldRushAdapter {
  static transformTokenBalances(response: GoldRushTokenBalancesResponse) {
    return {
      address: response.address,
      chainId: response.chain_id,
      chainName: response.chain_name,
      items: response.items.map(item => ({
        contractAddress: item.contract_address,
        name: item.contract_name,
        symbol: item.contract_ticker_symbol,
        decimals: item.contract_decimals,
        balance: item.balance,
        quote: item.quote || 0,
        logoUrl: item.logo_url,
        isNative: item.native_token,
      })),
    };
  }
  
  static transformTransactions(response: GoldRushTransactionsResponse) {
    return {
      address: response.address,
      chainId: response.chain_id,
      chainName: response.chain_name,
      items: response.items.map(tx => ({
        hash: tx.tx_hash,
        from: tx.from_address,
        to: tx.to_address,
        value: tx.value,
        gasSpent: tx.gas_spent,
        gasPrice: tx.gas_price,
        timestamp: new Date(tx.block_signed_at).getTime(),
        blockHeight: tx.block_height,
        successful: tx.successful,
      })),
    };
  }
}

