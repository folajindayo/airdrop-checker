import { goldrushClient } from './client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

interface TokenBalance {
  contract_address: string;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_decimals: number;
  logo_url: string;
  balance: string;
  quote: number;
  quote_rate: number;
  native_token: boolean;
}

interface TokenBalanceResponse {
  data: {
    address: string;
    updated_at: string;
    next_update_at: string;
    quote_currency: string;
    chain_id: number;
    items: TokenBalance[];
  };
  error: boolean;
  error_message: string | null;
  error_code: number | null;
}

/**
 * Fetch token balances for a wallet address on a specific chain
 */
export async function fetchTokenBalances(
  address: string,
  chainName: string
): Promise<TokenBalance[]> {
  try {
    const response = await goldrushClient.get<TokenBalanceResponse>(
      `/${chainName}/address/${address}/balances_v2/`
    );

    if (response.error) {
      console.error(`Error fetching token balances for ${chainName}:`, response.error_message);
      return [];
    }

    return response.data.items || [];
  } catch (error) {
    console.error(`Failed to fetch token balances for ${chainName}:`, error);
    return [];
  }
}

/**
 * Fetch token balances across all supported chains
 */
export async function fetchAllChainTokenBalances(
  address: string
): Promise<Record<number, TokenBalance[]>> {
  const results: Record<number, TokenBalance[]> = {};

  const promises = SUPPORTED_CHAINS.map(async (chain) => {
    const tokens = await fetchTokenBalances(address, chain.goldrushName);
    return { chainId: chain.id, tokens };
  });

  const chainResults = await Promise.all(promises);

  chainResults.forEach(({ chainId, tokens }) => {
    results[chainId] = tokens;
  });

  return results;
}

/**
 * Filter tokens with non-zero balance
 */
export function filterNonZeroBalances(tokens: TokenBalance[]): TokenBalance[] {
  return tokens.filter((token) => {
    const balance = BigInt(token.balance);
    return balance > 0n;
  });
}

/**
 * Get unique token symbols
 */
export function getUniqueTokenSymbols(tokens: TokenBalance[]): Set<string> {
  const symbols = new Set<string>();
  tokens.forEach((token) => {
    if (token.contract_ticker_symbol) {
      symbols.add(token.contract_ticker_symbol.toUpperCase());
    }
  });
  return symbols;
}

/**
 * Calculate total portfolio value in USD
 */
export function calculateTotalValue(
  chainTokens: Record<number, TokenBalance[]>
): number {
  let total = 0;

  Object.values(chainTokens).forEach((tokens) => {
    tokens.forEach((token) => {
      if (token.quote) {
        total += token.quote;
      }
    });
  });

  return total;
}

/**
 * Get tokens above a certain value threshold
 */
export function getTokensAboveValue(
  tokens: TokenBalance[],
  minValueUSD: number
): TokenBalance[] {
  return tokens.filter((token) => token.quote >= minValueUSD);
}

/**
 * Check if address holds specific token
 */
export function holdsToken(
  tokens: TokenBalance[],
  tokenSymbol: string
): boolean {
  return tokens.some(
    (token) => 
      token.contract_ticker_symbol.toUpperCase() === tokenSymbol.toUpperCase() &&
      BigInt(token.balance) > 0n
  );
}

