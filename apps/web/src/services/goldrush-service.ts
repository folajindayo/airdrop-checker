/**
 * GoldRush Service
 * Consolidated GoldRush API client integration
 */

export interface GoldRushConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class GoldRushService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: GoldRushConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.covalenthq.com/v1';
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`GoldRush API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getTokenBalances(chain: string, address: string): Promise<any> {
    return this.request(`/${chain}/address/${address}/balances_v2/`);
  }

  async getTransactions(chain: string, address: string): Promise<any> {
    return this.request(`/${chain}/address/${address}/transactions_v2/`);
  }

  async getNFTs(chain: string, address: string): Promise<any> {
    return this.request(`/${chain}/address/${address}/balances_nft/`);
  }

  async getTokenHolders(chain: string, tokenAddress: string): Promise<any> {
    return this.request(`/${chain}/tokens/${tokenAddress}/token_holders/`);
  }
}

export const goldRushService = new GoldRushService({
  apiKey: process.env.GOLDRUSH_API_KEY || '',
});

