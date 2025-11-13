import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ProtocolInteraction {
  protocol: string;
  chainId: number;
  chainName: string;
  date: string; // YYYY-MM-DD
  transactionCount: number;
  totalValue: number;
}

interface HeatmapData {
  address: string;
  interactions: ProtocolInteraction[];
  protocolList: string[];
  dateRange: {
    start: string;
    end: string;
  };
  totalInteractions: number;
  topProtocols: Array<{
    protocol: string;
    interactionCount: number;
    totalValue: number;
  }>;
  timestamp: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `protocol-heatmap:${normalizedAddress}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const interactionMap = new Map<string, ProtocolInteraction>();
    const protocolStats = new Map<string, { count: number; value: number }>();

    // Fetch transactions from all chains
    for (const chain of SUPPORTED_CHAINS) {
      try {
        const response = await goldrushClient.get(
          `/${chain.goldrushName}/address/${normalizedAddress}/transactions_v2/`,
          {
            'page-size': 100,
            'page-number': 1,
          }
        );

        if (response.data && response.data.items) {
          response.data.items.forEach((tx: any) => {
            const protocol = tx.protocol_name || 'unknown';
            const date = new Date(tx.block_signed_at).toISOString().split('T')[0];
            const key = `${protocol}-${chain.id}-${date}`;

            if (!interactionMap.has(key)) {
              interactionMap.set(key, {
                protocol,
                chainId: chain.id,
                chainName: chain.name,
                date,
                transactionCount: 0,
                totalValue: 0,
              });
            }

            const interaction = interactionMap.get(key)!;
            interaction.transactionCount += 1;
            interaction.totalValue += tx.value_quote || 0;

            // Update protocol stats
            if (!protocolStats.has(protocol)) {
              protocolStats.set(protocol, { count: 0, value: 0 });
            }
            const stats = protocolStats.get(protocol)!;
            stats.count += 1;
            stats.value += tx.value_quote || 0;
          });
        }
      } catch (error) {
        console.error(`Error fetching transactions for ${chain.name}:`, error);
      }
    }

    const interactions = Array.from(interactionMap.values());
    const protocolSet = new Set(interactions.map((i) => i.protocol));
    const protocolList = Array.from(protocolSet).sort();

    // Get date range
    const dates = interactions.map((i) => i.date).sort();
    const dateRange = {
      start: dates[0] || new Date().toISOString().split('T')[0],
      end: dates[dates.length - 1] || new Date().toISOString().split('T')[0],
    };

    // Get top protocols
    const topProtocols = Array.from(protocolStats.entries())
      .map(([protocol, stats]) => ({
        protocol,
        interactionCount: stats.count,
        totalValue: stats.value,
      }))
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, 10);

    const result: HeatmapData = {
      address: normalizedAddress,
      interactions,
      protocolList,
      dateRange,
      totalInteractions: interactions.reduce((sum, i) => sum + i.transactionCount, 0),
      topProtocols,
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching protocol heatmap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol heatmap' },
      { status: 500 }
    );
  }
}



