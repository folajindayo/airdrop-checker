/**
 * GoldRush API Client
 * Infrastructure layer client for blockchain data
 */

export interface GoldRushConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class GoldRushClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: GoldRushConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.covalenthq.com/v1';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Fetch wallet token balances
   */
  async getTokenBalances(chainId: number, address: string) {
    return this.request(
      `${chainId}/address/${address}/balances_v2/`,
      'GET'
    );
  }

  /**
   * Fetch wallet transactions
   */
  async getTransactions(chainId: number, address: string) {
    return this.request(
      `${chainId}/address/${address}/transactions_v2/`,
      'GET'
    );
  }

  /**
   * Fetch token holders
   */
  async getTokenHolders(chainId: number, tokenAddress: string) {
    return this.request(
      `${chainId}/tokens/${tokenAddress}/token_holders/`,
      'GET'
    );
  }

  /**
   * Fetch NFTs for wallet
   */
  async getNFTs(chainId: number, address: string) {
    return this.request(
      `${chainId}/address/${address}/balances_nft/`,
      'GET'
    );
  }

  /**
   * Generic request method
   */
  private async request(endpoint: string, method: string, body?: any) {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`GoldRush API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('GoldRush API request timeout');
      }
      
      throw error;
    }
  }
}

