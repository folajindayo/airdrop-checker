/**
 * GoldRush API Client
 */

export class GoldRushClient {
  private apiKey: string;
  private baseUrl = 'https://api.covalenthq.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getTokenBalances(chainId: number, address: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${chainId}/address/${address}/balances_v2/`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch token balances');
    }

    return response.json();
  }

  async getTransactions(chainId: number, address: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${chainId}/address/${address}/transactions_v2/`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  }

  async getNFTs(chainId: number, address: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${chainId}/address/${address}/balances_nft/`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch NFTs');
    }

    return response.json();
  }
}


