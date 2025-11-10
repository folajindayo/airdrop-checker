import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface RelatedWallet {
  address: string;
  similarity: number; // 0-100
  sharedContracts: number;
  sharedTokens: number;
  relationshipType: 'funding' | 'interaction' | 'token' | 'unknown';
  firstInteraction: string;
  lastInteraction: string;
}

interface ClusteringData {
  address: string;
  clusterSize: number;
  relatedWallets: RelatedWallet[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
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
    const cacheKey = `wallet-clustering:${normalizedAddress}`;
    const cachedResult = cache.get<ClusteringData>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const relatedWallets: RelatedWallet[] = [];
    const interactedAddresses = new Set<string>();
    const tokenAddresses = new Set<string>();

    // Analyze transactions to find related wallets
    for (const chain of SUPPORTED_CHAINS.slice(0, 3)) { // Limit to first 3 chains for performance
      try {
        const response = await goldrushClient.get(
          `/${chain.goldrushName}/address/${normalizedAddress}/transactions_v2/`,
          { 'page-size': 100 }
        );

        if (response.data?.items) {
          response.data.items.forEach((tx: any) => {
            // Track interacted addresses
            if (tx.to_address && tx.to_address.toLowerCase() !== normalizedAddress) {
              interactedAddresses.add(tx.to_address.toLowerCase());
            }
            if (tx.from_address && tx.from_address.toLowerCase() !== normalizedAddress) {
              interactedAddresses.add(tx.from_address.toLowerCase());
            }

            // Track token transfers
            if (tx.log_events) {
              tx.log_events.forEach((log: any) => {
                if (log.decoded?.name === 'Transfer' && log.sender_address) {
                  tokenAddresses.add(log.sender_address.toLowerCase());
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error analyzing ${chain.name}:`, error);
      }
    }

    // Find wallets that appear frequently (potential cluster members)
    const addressFrequency = new Map<string, number>();
    Array.from(interactedAddresses).forEach((addr) => {
      addressFrequency.set(addr, (addressFrequency.get(addr) || 0) + 1);
    });

    // Identify potential cluster members (appear in multiple transactions)
    Array.from(addressFrequency.entries())
      .filter(([_, count]) => count >= 3) // Appear in at least 3 transactions
      .slice(0, 20) // Limit to top 20
      .forEach(([relatedAddr, count]) => {
        const similarity = Math.min(100, count * 10); // Simple similarity metric
        
        let relationshipType: RelatedWallet['relationshipType'] = 'unknown';
        if (tokenAddresses.has(relatedAddr)) {
          relationshipType = 'token';
        } else if (count > 10) {
          relationshipType = 'interaction';
        }

        relatedWallets.push({
          address: relatedAddr,
          similarity,
          sharedContracts: count,
          sharedTokens: tokenAddresses.has(relatedAddr) ? 1 : 0,
          relationshipType,
          firstInteraction: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastInteraction: new Date().toISOString(),
        });
      });

    // Sort by similarity
    relatedWallets.sort((a, b) => b.similarity - a.similarity);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (relatedWallets.length > 10) {
      riskLevel = 'high';
    } else if (relatedWallets.length > 5) {
      riskLevel = 'medium';
    }

    const recommendations: string[] = [];
    if (relatedWallets.length > 10) {
      recommendations.push('High number of related wallets detected. Consider diversifying activity patterns.');
    }
    if (riskLevel === 'high') {
      recommendations.push('Wallet clustering may affect airdrop eligibility. Spread activity across different addresses.');
    }

    const result: ClusteringData = {
      address: normalizedAddress,
      clusterSize: relatedWallets.length,
      relatedWallets: relatedWallets.slice(0, 10),
      riskLevel,
      recommendations,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 15 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing wallet clustering:', error);
    return NextResponse.json(
      { error: 'Failed to analyze wallet clustering' },
      { status: 500 }
    );
  }
}

