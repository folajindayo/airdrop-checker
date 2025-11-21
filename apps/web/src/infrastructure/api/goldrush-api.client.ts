/**
 * GoldRush API Client
 * Handles all interactions with the Covalent GoldRush API
 */

export interface GoldRushConfig {
  apiKey: string;
  baseUrl?: string;
}

export class GoldRushApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: GoldRushConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.covalenthq.com';
  }

  async getTokenBalances(chainId: number, address: string) {
    return this.request(`/v1/${chainId}/address/${address}/balances_v2/`);
  }

  async getTransactions(chainId: number, address: string) {
    return this.request(`/v1/${chainId}/address/${address}/transactions_v2/`);
  }

  async getNFTs(chainId: number, address: string) {
    return this.request(`/v1/${chainId}/address/${address}/balances_nft/`);
  }

  private async request(endpoint: string) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GoldRush API error: ${response.statusText}`);
    }

    return response.json();
  }
}

