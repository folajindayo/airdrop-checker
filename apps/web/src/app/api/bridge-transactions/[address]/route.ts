import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface BridgeTransaction {
  chainId: number;
  chainName: string;
  fromChain: string;
  toChain: string;
  bridgeProtocol: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  amountFormatted: string;
  usdValue: number;
  transactionHash: string;
  timestamp: string;
  direction: 'deposit' | 'withdraw';
}

interface BridgeTransactionsResponse {
  address: string;
  totalBridges: number;
  totalValueUSD: number;
  bridges: BridgeTransaction[];
  byProtocol: Record<string, {
    protocol: string;
    bridgeCount: number;
    totalValueUSD: number;
    bridges: BridgeTransaction[];
  }>;
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    bridgeCount: number;
    bridges: BridgeTransaction[];
  }>;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: BridgeTransactionsResponse; expires: number }>();

// Common bridge contract addresses
const BRIDGE_PROTOCOLS: Record<string, { name: string; addresses: string[] }> = {
  'stargate': { name: 'Stargate', addresses: [] },
  'hop': { name: 'Hop Protocol', addresses: [] },
  'across': { name: 'Across', addresses: [] },
  'synapse': { name: 'Synapse', addresses: [] },
  'multichain': { name: 'Multichain', addresses: [] },
  'wormhole': { name: 'Wormhole', addresses: [] },
};

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
    const cacheKey = `bridge-transactions:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const bridges: BridgeTransaction[] = [];
    let totalValueUSD = 0;

    // Fetch transactions from all chains
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
            // Detect bridge transactions by checking contract interactions
            // Bridge protocols typically interact with specific contracts
            const toAddress = tx.to_address?.toLowerCase() || '';
            const logEvents = tx.log_events || [];
            
            // Check if transaction involves bridge-like patterns
            let bridgeProtocol = '';
            let isBridge = false;

            // Check log events for bridge patterns
            for (const log of logEvents) {
              const contractAddr = log.sender_address?.toLowerCase() || '';
              const decoded = log.decoded;
              
              // Look for bridge-related function calls
              if (decoded?.name) {
                const funcName = decoded.name.toLowerCase();
                if (funcName.includes('bridge') || 
                    funcName.includes('deposit') || 
                    funcName.includes('withdraw') ||
                    funcName.includes('swap') ||
                    funcName.includes('send')) {
                  isBridge = true;
                  
                  // Try to identify protocol from contract address or name
                  for (const [key, protocol] of Object.entries(BRIDGE_PROTOCOLS)) {
                    if (contractAddr.includes(key) || 
                        tx.to_address_label?.toLowerCase().includes(key)) {
                      bridgeProtocol = protocol.name;
                      break;
                    }
                  }
                  
                  if (!bridgeProtocol) {
                    bridgeProtocol = tx.to_address_label || 'Unknown Bridge';
                  }
                }
              }
            }

            if (isBridge && tx.log_events && tx.log_events.length > 0) {
              // Extract token information from log events
              for (const log of tx.log_events) {
                if (log.decoded?.name === 'Transfer' || log.sender_contract_ticker_symbol) {
                  const tokenSymbol = log.sender_contract_ticker_symbol || 'ETH';
                  const tokenAddress = log.sender_address || '';
                  const amount = log.decoded?.params?.find((p: any) => p.name === 'value')?.value || tx.value || '0';
                  const decimals = log.sender_contract_decimals || 18;
                  const amountFormatted = (parseFloat(amount) / Math.pow(10, decimals)).toFixed(6);
                  const usdValue = parseFloat(tx.value_quote || '0');

                  bridges.push({
                    chainId: chain.id,
                    chainName: chain.name,
                    fromChain: chain.name,
                    toChain: 'Unknown', // Would need cross-chain analysis
                    bridgeProtocol,
                    tokenAddress,
                    tokenSymbol,
                    amount,
                    amountFormatted,
                    usdValue,
                    transactionHash: tx.tx_hash,
                    timestamp: tx.block_signed_at,
                    direction: 'deposit', // Simplified - would need more analysis
                  });

                  totalValueUSD += usdValue;
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching bridge transactions for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by protocol
    const byProtocol: Record<string, any> = {};
    for (const bridge of bridges) {
      const protocolKey = bridge.bridgeProtocol;
      if (!byProtocol[protocolKey]) {
        byProtocol[protocolKey] = {
          protocol: protocolKey,
          bridgeCount: 0,
          totalValueUSD: 0,
          bridges: [],
        };
      }
      byProtocol[protocolKey].bridgeCount++;
      byProtocol[protocolKey].totalValueUSD += bridge.usdValue;
      byProtocol[protocolKey].bridges.push(bridge);
    }

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const bridge of bridges) {
      const chainKey = bridge.chainName;
      if (!byChain[chainKey]) {
        byChain[chainKey] = {
          chainId: bridge.chainId,
          chainName: bridge.chainName,
          bridgeCount: 0,
          bridges: [],
        };
      }
      byChain[chainKey].bridgeCount++;
      byChain[chainKey].bridges.push(bridge);
    }

    const result: BridgeTransactionsResponse = {
      address: address.toLowerCase(),
      totalBridges: bridges.length,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      bridges: bridges.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
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
    console.error('Error fetching bridge transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bridge transactions', details: error.message },
      { status: 500 }
    );
  }
}

