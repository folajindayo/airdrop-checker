import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface AirdropClaim {
  projectId: string;
  projectName: string;
  chainId: number;
  chainName: string;
  claimAddress?: string;
  claimStatus: 'claimable' | 'claimed' | 'not_eligible' | 'unknown';
  claimAmount?: string;
  claimAmountUSD?: number;
  transactionHash?: string;
  claimDate?: string;
  notes?: string;
}

interface AirdropClaimStatusResponse {
  address: string;
  totalAirdrops: number;
  claimableCount: number;
  claimedCount: number;
  totalClaimedValueUSD: number;
  claims: AirdropClaim[];
  byStatus: Record<string, AirdropClaim[]>;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: AirdropClaimStatusResponse; expires: number }>();

// Known airdrop claim addresses (would be expanded with actual addresses)
const AIRDROP_CLAIM_ADDRESSES: Record<string, { name: string; address: string; chainId: number }[]> = {
  'zora': [{ name: 'Zora', address: '', chainId: 8453 }],
  'layerzero': [{ name: 'LayerZero', address: '', chainId: 1 }],
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
    const cacheKey = `airdrop-claim-status:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const claims: AirdropClaim[] = [];
    let claimableCount = 0;
    let claimedCount = 0;
    let totalClaimedValueUSD = 0;

    // Check for claim transactions across all chains
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
            // Detect airdrop claim transactions
            // Claims typically involve receiving tokens from known airdrop addresses
            const toAddress = address.toLowerCase();
            const fromAddress = tx.from_address?.toLowerCase() || '';

            // Check if transaction is a claim (receiving tokens from airdrop contract)
            if (tx.log_events) {
              for (const log of tx.log_events) {
                if (log.decoded?.name === 'Transfer') {
                  const transferTo = log.decoded.params?.find((p: any) => p.name === 'to')?.value?.toLowerCase();
                  
                  if (transferTo === toAddress) {
                    // Check if this might be an airdrop claim
                    const tokenSymbol = log.sender_contract_ticker_symbol || '';
                    const amount = log.decoded.params?.find((p: any) => p.name === 'value')?.value || '0';
                    const usdValue = parseFloat(tx.value_quote || '0');

                    // Try to identify project from token or contract
                    let projectId = 'unknown';
                    let projectName = 'Unknown Airdrop';
                    
                    for (const [id, addresses] of Object.entries(AIRDROP_CLAIM_ADDRESSES)) {
                      if (addresses.some(a => a.address.toLowerCase() === fromAddress)) {
                        projectId = id;
                        projectName = addresses[0].name;
                        break;
                      }
                    }

                    // Check if this transaction was already claimed
                    const existingClaim = claims.find(c => 
                      c.transactionHash === tx.tx_hash
                    );

                    if (!existingClaim) {
                      claims.push({
                        projectId,
                        projectName,
                        chainId: chain.id,
                        chainName: chain.name,
                        claimAddress: fromAddress,
                        claimStatus: 'claimed',
                        claimAmount: amount,
                        claimAmountUSD: usdValue,
                        transactionHash: tx.tx_hash,
                        claimDate: tx.block_signed_at,
                      });

                      claimedCount++;
                      totalClaimedValueUSD += usdValue;
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error checking airdrop claim status for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by status
    const byStatus: Record<string, AirdropClaim[]> = {
      claimable: [],
      claimed: [],
      not_eligible: [],
      unknown: [],
    };

    for (const claim of claims) {
      if (!byStatus[claim.claimStatus]) {
        byStatus[claim.claimStatus] = [];
      }
      byStatus[claim.claimStatus].push(claim);
    }

    claimableCount = byStatus.claimable.length;
    claimedCount = byStatus.claimed.length;

    const result: AirdropClaimStatusResponse = {
      address: address.toLowerCase(),
      totalAirdrops: claims.length,
      claimableCount,
      claimedCount,
      totalClaimedValueUSD: Math.round(totalClaimedValueUSD * 100) / 100,
      claims: claims.sort((a, b) => {
        const dateA = a.claimDate ? new Date(a.claimDate).getTime() : 0;
        const dateB = b.claimDate ? new Date(b.claimDate).getTime() : 0;
        return dateB - dateA;
      }),
      byStatus,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error checking airdrop claim status:', error);
    return NextResponse.json(
      { error: 'Failed to check airdrop claim status', details: error.message },
      { status: 500 }
    );
  }
}

