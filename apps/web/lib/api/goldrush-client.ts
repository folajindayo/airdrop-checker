/**
 * GoldRush API Client
 */

export class GoldRushClient {
  private baseUrl = 'https://api.covalenthq.com/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async get(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GoldRush API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getTokenBalances(chainId: number, address: string) {
    return this.get(`/${chainId}/address/${address}/balances_v2/`);
  }

  async getTransactions(chainId: number, address: string) {
    return this.get(`/${chainId}/address/${address}/transactions_v3/`);
  }

  async getNFTs(chainId: number, address: string) {
    return this.get(`/${chainId}/address/${address}/balances_nft/`);
  }
}

