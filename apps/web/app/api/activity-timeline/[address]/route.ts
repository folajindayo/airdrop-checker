import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface ActivityEvent {
  chainId: number;
  chainName: string;
  type: 'transaction' | 'transfer' | 'swap' | 'stake' | 'bridge' | 'nft' | 'governance';
  description: string;
  transactionHash: string;
  timestamp: string;
  valueUSD?: number;
}

interface ActivityTimelineResponse {
  address: string;
  totalEvents: number;
  events: ActivityEvent[];
  byType: Record<string, ActivityEvent[]>;
  byChain: Record<string, ActivityEvent[]>;
  byDate: Record<string, ActivityEvent[]>;
  summary: {
    firstActivity: string | null;
    lastActivity: string | null;
    mostActiveDay: string | null;
    mostActiveChain: string | null;
    activityStreak: number;
  };
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: ActivityTimelineResponse; expires: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '200', 10);
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `activity-timeline:${address.toLowerCase()}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const events: ActivityEvent[] = [];

    // Fetch activity from all chains
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
            let eventType: ActivityEvent['type'] = 'transaction';
            let description = `Transaction on ${chain.name}`;

            // Determine event type from transaction data
            if (tx.log_events) {
              for (const log of tx.log_events) {
                const decoded = log.decoded;
                if (decoded) {
                  const funcName = decoded.name?.toLowerCase() || '';
                  
                  if (funcName.includes('swap') || funcName.includes('exchange')) {
                    eventType = 'swap';
                    description = `Swap on ${chain.name}`;
                  } else if (funcName.includes('stake') || funcName.includes('deposit')) {
                    eventType = 'stake';
                    description = `Staking on ${chain.name}`;
                  } else if (funcName.includes('bridge') || funcName.includes('cross')) {
                    eventType = 'bridge';
                    description = `Bridge transaction on ${chain.name}`;
                  } else if (funcName.includes('vote') || funcName.includes('proposal')) {
                    eventType = 'governance';
                    description = `Governance vote on ${chain.name}`;
                  } else if (decoded.name === 'Transfer') {
                    if (log.sender_contract_ticker_symbol) {
                      eventType = 'transfer';
                      description = `Token transfer on ${chain.name}`;
                    } else {
                      eventType = 'nft';
                      description = `NFT transfer on ${chain.name}`;
                    }
                  }
                }
              }
            }

            events.push({
              chainId: chain.id,
              chainName: chain.name,
              type: eventType,
              description,
              transactionHash: tx.tx_hash,
              timestamp: tx.block_signed_at,
              valueUSD: parseFloat(tx.value_quote || '0'),
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching activity timeline for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Group by type
    const byType: Record<string, ActivityEvent[]> = {};
    for (const event of events) {
      if (!byType[event.type]) {
        byType[event.type] = [];
      }
      byType[event.type].push(event);
    }

    // Group by chain
    const byChain: Record<string, ActivityEvent[]> = {};
    for (const event of events) {
      if (!byChain[event.chainName]) {
        byChain[event.chainName] = [];
      }
      byChain[event.chainName].push(event);
    }

    // Group by date
    const byDate: Record<string, ActivityEvent[]> = {};
    for (const event of events) {
      const dateKey = new Date(event.timestamp).toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = [];
      }
      byDate[dateKey].push(event);
    }

    // Calculate summary
    const firstActivity = events.length > 0 ? events[events.length - 1].timestamp : null;
    const lastActivity = events.length > 0 ? events[0].timestamp : null;
    
    const dateCounts = Object.entries(byDate).map(([date, evts]) => ({
      date,
      count: evts.length,
    }));
    const mostActiveDay = dateCounts.sort((a, b) => b.count - a.count)[0]?.date || null;
    
    const chainCounts = Object.entries(byChain).map(([chain, evts]) => ({
      chain,
      count: evts.length,
    }));
    const mostActiveChain = chainCounts.sort((a, b) => b.count - a.count)[0]?.chain || null;

    // Calculate activity streak (consecutive days with activity)
    let activityStreak = 0;
    const sortedDates = Object.keys(byDate).sort();
    let currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0 || 
          (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) <= 86400000) {
        currentStreak++;
        activityStreak = Math.max(activityStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    const result: ActivityTimelineResponse = {
      address: address.toLowerCase(),
      totalEvents: events.length,
      events,
      byType,
      byChain,
      byDate,
      summary: {
        firstActivity,
        lastActivity,
        mostActiveDay,
        mostActiveChain,
        activityStreak,
      },
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching activity timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity timeline', details: error.message },
      { status: 500 }
    );
  }
}

