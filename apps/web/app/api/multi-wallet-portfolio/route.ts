import { NextRequest, NextResponse } from 'next/server';
import { fetchAllChainTokenBalances, calculateTotalValue } from '@/lib/goldrush/tokens';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface MultiWalletPortfolio {
  wallets: Array<{
    address: string;
    totalValue: number;
    tokenCount: number;
    chainCount: number;
  }>;
  aggregate: {
    totalValue: number;
    uniqueTokens: number;
    chainsUsed: number;
    walletCount: number;
  };
  chainDistribution: Array<{
    chainId: number;
    chainName: string;
    totalValue: number;
    walletCount: number;
  }>;
  topHoldings: Array<{
    symbol: string;
    totalValue: number;
    walletCount: number;
    chains: number[];
  }>;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Addresses array is required' },
        { status: 400 }
      );
    }

    if (addresses.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 wallets allowed' },
        { status: 400 }
      );
    }

    // Validate all addresses
    for (const address of addresses) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return NextResponse.json(
          { error: `Invalid address: ${address}` },
          { status: 400 }
        );
      }
    }

    // Fetch portfolio data for all wallets
    const walletData = await Promise.all(
      addresses.map(async (address: string) => {
        const chainTokens = await fetchAllChainTokenBalances(address);
        const totalValue = calculateTotalValue(chainTokens);
        
        const tokenCount = Object.values(chainTokens).reduce(
          (sum, tokens) => sum + tokens.filter(t => BigInt(t.balance) > 0n).length,
          0
        );
        
        const chainCount = Object.values(chainTokens).filter(
          (tokens) => tokens.some(t => BigInt(t.balance) > 0n)
        ).length;

        return {
          address,
          totalValue,
          tokenCount,
          chainCount,
          chainTokens,
        };
      })
    );

    // Calculate aggregate metrics
    const aggregateTotalValue = walletData.reduce((sum, w) => sum + w.totalValue, 0);
    
    const allTokens = new Set<string>();
    const chainSet = new Set<number>();
    
    walletData.forEach((wallet) => {
      Object.entries(wallet.chainTokens).forEach(([chainIdStr, tokens]) => {
        const chainId = parseInt(chainIdStr);
        chainSet.add(chainId);
        
        tokens.forEach((token) => {
          if (BigInt(token.balance) > 0n) {
            const key = `${token.contract_address.toLowerCase()}-${chainId}`;
            allTokens.add(key);
          }
        });
      });
    });

    // Build chain distribution
    const chainDistributionMap = new Map<number, { totalValue: number; walletCount: number }>();
    
    walletData.forEach((wallet) => {
      Object.entries(wallet.chainTokens).forEach(([chainIdStr, tokens]) => {
        const chainId = parseInt(chainIdStr);
        const chainValue = tokens.reduce((sum, t) => sum + (t.quote || 0), 0);
        
        if (chainValue > 0) {
          if (!chainDistributionMap.has(chainId)) {
            chainDistributionMap.set(chainId, { totalValue: 0, walletCount: 0 });
          }
          
          const chainData = chainDistributionMap.get(chainId)!;
          chainData.totalValue += chainValue;
          chainData.walletCount += 1;
        }
      });
    });

    const chainDistribution = Array.from(chainDistributionMap.entries())
      .map(([chainId, data]) => {
        const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
        return {
          chainId,
          chainName: chain?.name || `Chain ${chainId}`,
          ...data,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue);

    // Build top holdings across all wallets
    const tokenMap = new Map<string, {
      symbol: string;
      totalValue: number;
      walletCount: number;
      chains: Set<number>;
    }>();

    walletData.forEach((wallet) => {
      Object.entries(wallet.chainTokens).forEach(([chainIdStr, tokens]) => {
        const chainId = parseInt(chainIdStr);
        
        tokens.forEach((token) => {
          if (token.quote && token.quote > 0) {
            const key = token.contract_ticker_symbol?.toUpperCase() || 'UNKNOWN';
            
            if (!tokenMap.has(key)) {
              tokenMap.set(key, {
                symbol: key,
                totalValue: 0,
                walletCount: 0,
                chains: new Set(),
              });
            }
            
            const tokenData = tokenMap.get(key)!;
            tokenData.totalValue += token.quote;
            tokenData.chains.add(chainId);
            
            // Check if this wallet holds this token
            if (BigInt(token.balance) > 0n) {
              tokenData.walletCount += 1;
            }
          }
        });
      });
    });

    const topHoldings = Array.from(tokenMap.values())
      .map((token) => ({
        ...token,
        chains: Array.from(token.chains),
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 20);

    const response: MultiWalletPortfolio = {
      wallets: walletData.map((w) => ({
        address: w.address,
        totalValue: w.totalValue,
        tokenCount: w.tokenCount,
        chainCount: w.chainCount,
      })),
      aggregate: {
        totalValue: aggregateTotalValue,
        uniqueTokens: allTokens.size,
        chainsUsed: chainSet.size,
        walletCount: addresses.length,
      },
      chainDistribution,
      topHoldings,
      timestamp: Date.now(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching multi-wallet portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch multi-wallet portfolio' },
      { status: 500 }
    );
  }
}

