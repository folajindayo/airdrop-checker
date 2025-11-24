import { goldrushClient } from './client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import type { GoldRushTransaction } from '@airdrop-finder/shared';

interface TransactionResponse {
  data: {
    address: string;
    updated_at: string;
    next_update_at: string;
    quote_currency: string;
    chain_id: number;
    chain_name: string;
    items: GoldRushTransaction[];
    pagination: {
      has_more: boolean;
      page_number: number;
      page_size: number;
      total_count: number;
    };
  };
  error: boolean;
  error_message: string | null;
  error_code: number | null;
}

/**
 * Fetch transactions for a wallet address on a specific chain
 */
export async function fetchTransactions(
  address: string,
  chainName: string,
  options: {
    pageSize?: number;
    pageNumber?: number;
  } = {}
): Promise<GoldRushTransaction[]> {
  const { pageSize = 100, pageNumber = 0 } = options;

  try {
    const response = await goldrushClient.get<TransactionResponse>(
      `/${chainName}/address/${address}/transactions_v3/`,
      {
        'page-size': pageSize,
        'page-number': pageNumber,
      }
    );

    if (response.error) {
      console.error(`Error fetching transactions for ${chainName}:`, response.error_message);
      return [];
    }

    return response.data.items || [];
  } catch (error) {
    console.error(`Failed to fetch transactions for ${chainName}:`, error);
    return [];
  }
}

/**
 * Fetch transactions across all supported chains for a wallet
 */
export async function fetchAllChainTransactions(
  address: string
): Promise<Record<number, GoldRushTransaction[]>> {
  const results: Record<number, GoldRushTransaction[]> = {};

  // Fetch transactions for each supported chain in parallel
  const promises = SUPPORTED_CHAINS.map(async (chain) => {
    const transactions = await fetchTransactions(address, chain.goldrushName);
    return { chainId: chain.id, transactions };
  });

  const chainResults = await Promise.all(promises);

  chainResults.forEach(({ chainId, transactions }) => {
    results[chainId] = transactions;
  });

  return results;
}

/**
 * Get transaction count per chain
 */
export function getTransactionCountPerChain(
  chainTransactions: Record<number, GoldRushTransaction[]>
): Record<number, number> {
  const counts: Record<number, number> = {};

  Object.entries(chainTransactions).forEach(([chainId, transactions]) => {
    counts[Number(chainId)] = transactions.length;
  });

  return counts;
}

/**
 * Get unique contract addresses interacted with
 */
export function getUniqueContracts(
  transactions: GoldRushTransaction[]
): Set<string> {
  const contracts = new Set<string>();

  transactions.forEach((tx) => {
    if (tx.to_address) {
      contracts.add(tx.to_address.toLowerCase());
    }
  });

  return contracts;
}

/**
 * Get transactions within a date range
 */
export function filterTransactionsByDate(
  transactions: GoldRushTransaction[],
  startDate: Date,
  endDate: Date
): GoldRushTransaction[] {
  return transactions.filter((tx) => {
    const txDate = new Date(tx.block_signed_at);
    return txDate >= startDate && txDate <= endDate;
  });
}

