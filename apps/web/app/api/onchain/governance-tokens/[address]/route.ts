import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Common governance token addresses
const GOVERNANCE_TOKENS: Record<number, Record<string, string>> = {
  [1]: { // Ethereum
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  },
};

/**
 * GET /api/onchain/governance-tokens/[address]
 * Track governance token holdings for a wallet
 * Uses GoldRush API for token balance data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-governance-tokens:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const holdings: any[] = [];
    let totalValue = 0;

    for (const chain of targetChains) {
      try {
        const governanceTokens = GOVERNANCE_TOKENS[chain.id] || {};
        
        // Check each known governance token
        for (const [symbol, tokenAddress] of Object.entries(governanceTokens)) {
          try {
            const response = await goldrushClient.get(
              `/v2/${chain.id}/address/${normalizedAddress}/balances_v2/`,
              {
                'quote-currency': 'USD',
                'format': 'json',
                'contract-address': tokenAddress.toLowerCase(),
              }
            );

            if (response.data?.items && response.data.items.length > 0) {
              const token = response.data.items[0];
              
              if (token.balance && parseFloat(token.balance) > 0) {
                holdings.push({
                  chainId: chain.id,
                  chainName: chain.name,
                  tokenAddress: tokenAddress.toLowerCase(),
                  tokenSymbol: symbol,
                  tokenName: token.contract_name,
                  balance: token.balance,
                  balanceFormatted: token.pretty_quote,
                  valueUSD: token.quote || 0,
                  logoUrl: token.logo_url,
                  isGovernanceToken: true,
                });

                totalValue += token.quote || 0;
              }
            }
          } catch (error) {
            // Token not found or error, continue
          }
        }

        // Also check for any tokens that might be governance tokens
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'nft': 'false',
          }
        );

        if (response.data?.items) {
          response.data.items.forEach((token: any) => {
            // Check if token name/symbol suggests governance
            const isGovernance = token.contract_name?.toLowerCase().includes('governance') ||
                               token.contract_ticker_symbol?.includes('GOV') ||
                               token.contract_ticker_symbol?.includes('DAO');

            if (isGovernance && token.quote > 0) {
              // Check if we already have this token
              const exists = holdings.find(h => 
                h.tokenAddress === token.contract_address.toLowerCase()
              );

              if (!exists) {
                holdings.push({
                  chainId: chain.id,
                  chainName: chain.name,
                  tokenAddress: token.contract_address,
                  tokenSymbol: token.contract_ticker_symbol,
                  tokenName: token.contract_name,
                  balance: token.balance,
                  balanceFormatted: token.pretty_quote,
                  valueUSD: token.quote || 0,
                  logoUrl: token.logo_url,
                  isGovernanceToken: true,
                });

                totalValue += token.quote || 0;
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching governance tokens on ${chain.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      holdings,
      summary: {
        totalGovernanceTokens: holdings.length,
        totalValueUSD: totalValue,
        byChain: chains.reduce((acc, chain) => {
          acc[chain.name] = holdings
            .filter(h => h.chainId === chain.id)
            .reduce((sum, h) => sum + h.valueUSD, 0);
          return acc;
        }, {} as Record<string, number>),
      },
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain governance tokens API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch governance tokens',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

