/**
 * PortfolioOverview Component
 */

'use client';

import { useState, useEffect } from 'react';
import { PortfolioService, PortfolioToken } from '../lib/services/portfolio.service';
import { formatBalance } from '../lib/utils/consolidated/format.utils';
import { Card } from './ui/Card';

interface PortfolioOverviewProps {
  address: string;
}

export function PortfolioOverview({ address }: PortfolioOverviewProps) {
  const [tokens, setTokens] = useState<PortfolioToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const service = new PortfolioService();
        const data = await service.getPortfolio(address);
        setTokens(data);
        
        const total = data.reduce((sum, token) => sum + token.value, 0);
        setTotalValue(total);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [address]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-xl font-bold mb-2">Total Value</h3>
        <p className="text-3xl font-bold text-blue-600">
          ${formatBalance(totalValue)}
        </p>
      </Card>

      <div className="grid gap-3">
        {tokens.map((token) => (
          <Card key={token.address}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{token.symbol}</p>
                <p className="text-sm text-gray-500">{token.balance}</p>
              </div>
              <p className="font-bold">${formatBalance(token.value)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

