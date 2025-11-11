import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface StakingPosition {
  chainId: number;
  chainName: string;
  protocol: string;
  tokenAddress: string;
  tokenSymbol: string;
  stakedAmount: string;
  stakedAmountFormatted: string;
  rewardAmount?: string;
  rewardAmountFormatted?: string;
  valueUSD: number;
  apy?: number;
  unlockDate?: string;
  lastUpdated: string;
}

interface StakingPositionsResponse {
  address: string;
  totalPositions: number;
  totalStakedUSD: number;
  totalRewardsUSD: number;
  positions: StakingPosition[];
  byProtocol: Record<string, {
    protocol: string;
    positionCount: number;
    totalStakedUSD: number;
    positions: StakingPosition[];
  }>;
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    positionCount: number;
    totalStakedUSD: number;
    positions: StakingPosition[];
  }>;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: StakingPositionsResponse; expires: number }>();

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
    const cacheKey = `staking-positions:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const positions: StakingPosition[] = [];
    let totalStakedUSD = 0;
    let totalRewardsUSD = 0;

    // Fetch staking positions from all chains
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
          const stakingMap: Record<string, StakingPosition> = {};

          for (const tx of response.data.items) {
            if (tx.log_events) {
              for (const log of tx.log_events) {
                const decoded = log.decoded;
                if (decoded) {
                  const funcName = decoded.name?.toLowerCase() || '';
                  
                  // Detect staking-related functions
                  if (funcName.includes('stake') || 
                      funcName.includes('deposit') ||
                      funcName.includes('lock')) {
                    
                    const tokenAddress = log.sender_address || '';
                    const tokenSymbol = log.sender_contract_ticker_symbol || 'Unknown';
                    const key = `${chain.id}:${tokenAddress}`;

                    if (!stakingMap[key]) {
                      stakingMap[key] = {
                        chainId: chain.id,
                        chainName: chain.name,
                        protocol: tx.to_address_label || 'Unknown Protocol',
                        tokenAddress,
                        tokenSymbol,
                        stakedAmount: '0',
                        stakedAmountFormatted: '0',
                        valueUSD: 0,
                        lastUpdated: tx.block_signed_at,
                      };
                    }

                    // Extract staked amount
                    const amountParam = decoded.params?.find((p: any) => 
                      p.name?.toLowerCase().includes('amount') || 
                      p.name?.toLowerCase().includes('value')
                    );
                    if (amountParam) {
                      const amount = amountParam.value || '0';
                      const decimals = log.sender_contract_decimals || 18;
                      const amountFormatted = (parseFloat(amount) / Math.pow(10, decimals)).toFixed(6);
                      
                      const currentStaked = BigInt(stakingMap[key].stakedAmount);
                      const newAmount = BigInt(amount);
                      stakingMap[key].stakedAmount = (currentStaked + newAmount).toString();
                      stakingMap[key].stakedAmountFormatted = (
                        parseFloat(stakingMap[key].stakedAmount) / Math.pow(10, decimals)
                      ).toFixed(6);
                    }

                    const usdValue = parseFloat(tx.value_quote || '0');
                    stakingMap[key].valueUSD += usdValue;
                    totalStakedUSD += usdValue;
                  }

                  // Detect reward claims
                  if (funcName.includes('claim') || funcName.includes('reward')) {
                    const tokenAddress = log.sender_address || '';
                    const key = `${chain.id}:${tokenAddress}`;
                    
                    if (stakingMap[key]) {
                      const amountParam = decoded.params?.find((p: any) => 
                        p.name?.toLowerCase().includes('amount')
                      );
                      if (amountParam) {
                        const rewardAmount = amountParam.value || '0';
                        const decimals = log.sender_contract_decimals || 18;
                        const rewardFormatted = (parseFloat(rewardAmount) / Math.pow(10, decimals)).toFixed(6);
                        
                        stakingMap[key].rewardAmount = rewardAmount;
                        stakingMap[key].rewardAmountFormatted = rewardFormatted;
                        
                        const rewardUSD = parseFloat(tx.value_quote || '0');
                        totalRewardsUSD += rewardUSD;
                      }
                    }
                  }
                }
              }
            }
          }

          positions.push(...Object.values(stakingMap));
        }
      } catch (error) {
        console.error(`Error fetching staking positions for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by protocol
    const byProtocol: Record<string, any> = {};
    for (const position of positions) {
      if (!byProtocol[position.protocol]) {
        byProtocol[position.protocol] = {
          protocol: position.protocol,
          positionCount: 0,
          totalStakedUSD: 0,
          positions: [],
        };
      }
      byProtocol[position.protocol].positionCount++;
      byProtocol[position.protocol].totalStakedUSD += position.valueUSD;
      byProtocol[position.protocol].positions.push(position);
    }

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const position of positions) {
      if (!byChain[position.chainName]) {
        byChain[position.chainName] = {
          chainId: position.chainId,
          chainName: position.chainName,
          positionCount: 0,
          totalStakedUSD: 0,
          positions: [],
        };
      }
      byChain[position.chainName].positionCount++;
      byChain[position.chainName].totalStakedUSD += position.valueUSD;
      byChain[position.chainName].positions.push(position);
    }

    const result: StakingPositionsResponse = {
      address: address.toLowerCase(),
      totalPositions: positions.length,
      totalStakedUSD: Math.round(totalStakedUSD * 100) / 100,
      totalRewardsUSD: Math.round(totalRewardsUSD * 100) / 100,
      positions: positions.sort((a, b) => b.valueUSD - a.valueUSD),
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
    console.error('Error fetching staking positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staking positions', details: error.message },
      { status: 500 }
    );
  }
}

