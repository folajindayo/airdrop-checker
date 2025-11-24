/**
 * Token Service
 */

import { TokenBalance } from '../types/wallet.types';

export class TokenService {
  async getTokenBalances(address: string, chainId: number): Promise<TokenBalance[]> {
    try {
      const response = await fetch(
        `/api/tokens?address=${address}&chainId=${chainId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch token balances');
      }
      
      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('TokenService error:', error);
      return [];
    }
  }

  async getTokenPrice(tokenAddress: string, chainId: number): Promise<number> {
    try {
      const response = await fetch(
        `/api/price?token=${tokenAddress}&chainId=${chainId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch token price');
      }
      
      const data = await response.json();
      return data.price || 0;
    } catch (error) {
      console.error('TokenService price error:', error);
      return 0;
    }
  }
}

export const tokenService = new TokenService();

