import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface TokenTransfer {
  chainId: number;
  chainName: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  amountFormatted: string;
  usdValue: number;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
  transferType: 'incoming' | 'outgoing';
}

interface TokenTransfersResponse {
  address: string;
  totalTransfers: number;
  incomingTransfers: number;
  outgoingTransfers: number;
  totalValueUSD: number;
  transfers: TokenTransfer[];
  byToken: Record<string, {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    transferCount: number;
    totalAmount: string;
    totalValueUSD: number;
    transfers: TokenTransfer[];
  }>;
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    transferCount: number;
    transfers: TokenTransfer[];
  }>;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: TokenTransfersResponse; expires: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const transferType = searchParams.get('type') as 'incoming' | 'outgoing' | null;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `token-transfers:${address.toLowerCase()}:${limit}:${transferType || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const transfers: TokenTransfer[] = [];
    const addressLower = address.toLowerCase();
    let incomingCount = 0;
    let outgoingCount = 0;
    let totalValueUSD = 0;

    // Fetch token transfers from all chains
    for (const chain of CHAINS) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        const response = await goldrushClient.get(
          `/v2/${chainName}/address/${address}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'page-size': limit,
          }
        );

        if (response.data?.items) {
          for (const tx of response.data.items) {
            // Check log events for token transfers
            if (tx.log_events) {
              for (const log of tx.log_events) {
                if (log.decoded && log.decoded.name === 'Transfer') {
                  const fromAddr = log.decoded.params?.find((p: any) => p.name === 'from')?.value?.toLowerCase();
                  const toAddr = log.decoded.params?.find((p: any) => p.name === 'to')?.value?.toLowerCase();
                  const amount = log.decoded.params?.find((p: any) => p.name === 'value')?.value || '0';

                  if (fromAddr === addressLower || toAddr === addressLower) {
                    const transferTypeValue: 'incoming' | 'outgoing' = toAddr === addressLower ? 'incoming' : 'outgoing';
                    
                    if (transferType && transferType !== transferTypeValue) {
                      continue;
                    }

                    const tokenInfo = log.sender_contract_ticker_symbol 
                      ? {
                          address: log.sender_address || '',
                          symbol: log.sender_contract_ticker_symbol,
                          name: log.sender_contract_label || log.sender_contract_ticker_symbol,
                          decimals: log.sender_contract_decimals || 18,
                        }
                      : {
                          address: '',
                          symbol: 'ETH',
                          name: 'Ethereum',
                          decimals: 18,
                        };

                    const amountFormatted = (parseFloat(amount) / Math.pow(10, tokenInfo.decimals)).toFixed(6);
                    const usdValue = parseFloat(tx.value_quote || '0');

                    transfers.push({
                      chainId: chain.id,
                      chainName: chain.name,
                      tokenAddress: tokenInfo.address,
                      tokenSymbol: tokenInfo.symbol,
                      tokenName: tokenInfo.name,
                      fromAddress: fromAddr,
                      toAddress: toAddr,
                      amount: amount,
                      amountFormatted,
                      usdValue,
                      transactionHash: tx.tx_hash,
                      blockNumber: tx.block_height,
                      timestamp: tx.block_signed_at,
                      transferType: transferTypeValue,
                    });

                    if (transferTypeValue === 'incoming') {
                      incomingCount++;
                    } else {
                      outgoingCount++;
                    }
                    totalValueUSD += usdValue;
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching token transfers for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by token
    const byToken: Record<string, any> = {};
    for (const transfer of transfers) {
      const tokenKey = transfer.tokenAddress || 'native';
      if (!byToken[tokenKey]) {
        byToken[tokenKey] = {
          tokenAddress: transfer.tokenAddress,
          tokenSymbol: transfer.tokenSymbol,
          tokenName: transfer.tokenName,
          transferCount: 0,
          totalAmount: '0',
          totalValueUSD: 0,
          transfers: [],
        };
      }
      byToken[tokenKey].transferCount++;
      byToken[tokenKey].totalAmount = (
        parseFloat(byToken[tokenKey].totalAmount) + parseFloat(transfer.amount)
      ).toString();
      byToken[tokenKey].totalValueUSD += transfer.usdValue;
      byToken[tokenKey].transfers.push(transfer);
    }

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const transfer of transfers) {
      const chainKey = transfer.chainName;
      if (!byChain[chainKey]) {
        byChain[chainKey] = {
          chainId: transfer.chainId,
          chainName: transfer.chainName,
          transferCount: 0,
          transfers: [],
        };
      }
      byChain[chainKey].transferCount++;
      byChain[chainKey].transfers.push(transfer);
    }

    const result: TokenTransfersResponse = {
      address: addressLower,
      totalTransfers: transfers.length,
      incomingTransfers: incomingCount,
      outgoingTransfers: outgoingCount,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      transfers: transfers.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      byToken,
      byChain,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching token transfers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token transfers', details: error.message },
      { status: 500 }
    );
  }
}

