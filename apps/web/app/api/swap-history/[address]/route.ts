import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface SwapTransaction {
  chainId: number;
  chainName: string;
  protocol: string;
  tokenIn: string;
  tokenInSymbol: string;
  tokenOut: string;
  tokenOutSymbol: string;
  amountIn: string;
  amountInFormatted: string;
  amountOut: string;
  amountOutFormatted: string;
  valueUSD: number;
  transactionHash: string;
  timestamp: string;
}

interface SwapHistoryResponse {
  address: string;
  totalSwaps: number;
  totalValueUSD: number;
  swaps: SwapTransaction[];
  byProtocol: Record<string, {
    protocol: string;
    swapCount: number;
    totalValueUSD: number;
    swaps: SwapTransaction[];
  }>;
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    swapCount: number;
    totalValueUSD: number;
    swaps: SwapTransaction[];
  }>;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: SwapHistoryResponse; expires: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `swap-history:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const swaps: SwapTransaction[] = [];
    let totalValueUSD = 0;

    // Fetch swap transactions from all chains
    for (const chain of CHAINS) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        const response = await goldrushClient.get(
          `/v2/${chainName}/address/${address}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          for (const tx of response.data.items) {
            if (tx.log_events) {
              // Detect swap transactions by looking for swap-related events
              let swapDetected = false;
              let protocol = 'Unknown';
              let tokenIn = '';
              let tokenInSymbol = '';
              let tokenOut = '';
              let tokenOutSymbol = '';
              let amountIn = '0';
              let amountOut = '0';

              // Check for swap-related function calls
              for (const log of tx.log_events) {
                const decoded = log.decoded;
                if (decoded) {
                  const funcName = decoded.name?.toLowerCase() || '';
                  
                  if (funcName.includes('swap') || 
                      funcName.includes('exchange') ||
                      funcName.includes('trade')) {
                    swapDetected = true;
                    
                    // Try to identify protocol
                    if (tx.to_address_label) {
                      protocol = tx.to_address_label;
                    } else if (tx.to_address) {
                      // Check against known DEX addresses
                      const toAddr = tx.to_address.toLowerCase();
                      if (toAddr.includes('uniswap') || toAddr.includes('0x7a250d5630b4cf539739df2c5dacb4c659f2488d')) {
                        protocol = 'Uniswap';
                      } else if (toAddr.includes('sushi') || toAddr.includes('0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f')) {
                        protocol = 'SushiSwap';
                      } else if (toAddr.includes('pancake')) {
                        protocol = 'PancakeSwap';
                      }
                    }

                    // Try to extract swap amounts from log events
                    for (const swapLog of tx.log_events) {
                      if (swapLog.decoded?.name === 'Transfer') {
                        const from = swapLog.decoded.params?.find((p: any) => p.name === 'from')?.value?.toLowerCase();
                        const to = swapLog.decoded.params?.find((p: any) => p.name === 'to')?.value?.toLowerCase();
                        const amount = swapLog.decoded.params?.find((p: any) => p.name === 'value')?.value || '0';
                        
                        if (from === address.toLowerCase()) {
                          // Outgoing token
                          if (!tokenIn) {
                            tokenIn = swapLog.sender_address || '';
                            tokenInSymbol = swapLog.sender_contract_ticker_symbol || 'Unknown';
                            amountIn = amount;
                          }
                        } else if (to === address.toLowerCase()) {
                          // Incoming token
                          if (!tokenOut) {
                            tokenOut = swapLog.sender_address || '';
                            tokenOutSymbol = swapLog.sender_contract_ticker_symbol || 'Unknown';
                            amountOut = amount;
                          }
                        }
                      }
                    }

                    if (swapDetected) {
                      const decimalsIn = tx.log_events.find((l: any) => 
                        l.sender_address?.toLowerCase() === tokenIn.toLowerCase()
                      )?.sender_contract_decimals || 18;
                      const decimalsOut = tx.log_events.find((l: any) => 
                        l.sender_address?.toLowerCase() === tokenOut.toLowerCase()
                      )?.sender_contract_decimals || 18;

                      const amountInFormatted = (parseFloat(amountIn) / Math.pow(10, decimalsIn)).toFixed(6);
                      const amountOutFormatted = (parseFloat(amountOut) / Math.pow(10, decimalsOut)).toFixed(6);
                      const usdValue = parseFloat(tx.value_quote || '0');

                      swaps.push({
                        chainId: chain.id,
                        chainName: chain.name,
                        protocol,
                        tokenIn,
                        tokenInSymbol,
                        tokenOut,
                        tokenOutSymbol,
                        amountIn,
                        amountInFormatted,
                        amountOut,
                        amountOutFormatted,
                        valueUSD: usdValue,
                        transactionHash: tx.tx_hash,
                        timestamp: tx.block_signed_at,
                      });

                      totalValueUSD += usdValue;
                      break; // Only count each transaction once
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching swap history for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by protocol
    const byProtocol: Record<string, any> = {};
    for (const swap of swaps) {
      if (!byProtocol[swap.protocol]) {
        byProtocol[swap.protocol] = {
          protocol: swap.protocol,
          swapCount: 0,
          totalValueUSD: 0,
          swaps: [],
        };
      }
      byProtocol[swap.protocol].swapCount++;
      byProtocol[swap.protocol].totalValueUSD += swap.valueUSD;
      byProtocol[swap.protocol].swaps.push(swap);
    }

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const swap of swaps) {
      if (!byChain[swap.chainName]) {
        byChain[swap.chainName] = {
          chainId: swap.chainId,
          chainName: swap.chainName,
          swapCount: 0,
          totalValueUSD: 0,
          swaps: [],
        };
      }
      byChain[swap.chainName].swapCount++;
      byChain[swap.chainName].totalValueUSD += swap.valueUSD;
      byChain[swap.chainName].swaps.push(swap);
    }

    const result: SwapHistoryResponse = {
      address: address.toLowerCase(),
      totalSwaps: swaps.length,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      swaps: swaps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      byProtocol,
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
    console.error('Error fetching swap history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swap history', details: error.message },
      { status: 500 }
    );
  }
}

