import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface GovernanceVote {
  chainId: number;
  chainName: string;
  protocol: string;
  proposalId: string;
  proposalTitle?: string;
  vote: 'for' | 'against' | 'abstain';
  votingPower: string;
  votingPowerFormatted: string;
  transactionHash: string;
  timestamp: string;
}

interface GovernanceParticipationResponse {
  address: string;
  totalVotes: number;
  protocols: string[];
  votes: GovernanceVote[];
  byProtocol: Record<string, {
    protocol: string;
    voteCount: number;
    votes: GovernanceVote[];
  }>;
  participationScore: number;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: GovernanceParticipationResponse; expires: number }>();

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
    const cacheKey = `governance-participation:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const votes: GovernanceVote[] = [];
    const protocolSet = new Set<string>();

    // Fetch governance votes from all chains
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
              for (const log of tx.log_events) {
                const decoded = log.decoded;
                if (decoded) {
                  const funcName = decoded.name?.toLowerCase() || '';
                  
                  // Detect governance-related functions
                  if (funcName.includes('vote') || 
                      funcName.includes('cast') ||
                      funcName.includes('proposal') ||
                      funcName.includes('delegate')) {
                    
                    const protocol = tx.to_address_label || 'Unknown Protocol';
                    protocolSet.add(protocol);

                    // Try to extract proposal ID and vote
                    const proposalIdParam = decoded.params?.find((p: any) => 
                      p.name?.toLowerCase().includes('proposal') || 
                      p.name?.toLowerCase().includes('id')
                    );
                    const voteParam = decoded.params?.find((p: any) => 
                      p.name?.toLowerCase().includes('vote') || 
                      p.name?.toLowerCase().includes('support')
                    );

                    const proposalId = proposalIdParam?.value?.toString() || tx.tx_hash.slice(0, 10);
                    const voteValue = voteParam?.value;
                    
                    let vote: 'for' | 'against' | 'abstain' = 'abstain';
                    if (typeof voteValue === 'number' || typeof voteValue === 'string') {
                      const voteNum = typeof voteValue === 'string' ? parseInt(voteValue, 10) : voteValue;
                      if (voteNum === 1 || voteValue === '1' || voteValue === 'true') {
                        vote = 'for';
                      } else if (voteNum === 0 || voteValue === '0' || voteValue === 'false') {
                        vote = 'against';
                      }
                    }

                    votes.push({
                      chainId: chain.id,
                      chainName: chain.name,
                      protocol,
                      proposalId,
                      vote,
                      votingPower: '0', // Would need separate call to get voting power
                      votingPowerFormatted: '0',
                      transactionHash: tx.tx_hash,
                      timestamp: tx.block_signed_at,
                    });
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching governance participation for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by protocol
    const byProtocol: Record<string, any> = {};
    for (const vote of votes) {
      if (!byProtocol[vote.protocol]) {
        byProtocol[vote.protocol] = {
          protocol: vote.protocol,
          voteCount: 0,
          votes: [],
        };
      }
      byProtocol[vote.protocol].voteCount++;
      byProtocol[vote.protocol].votes.push(vote);
    }

    // Calculate participation score (0-100)
    const participationScore = Math.min(
      votes.length * 10 + // Base score from votes
      protocolSet.size * 15 + // Bonus for multiple protocols
      (votes.length > 10 ? 20 : 0), // Bonus for high activity
      100
    );

    const result: GovernanceParticipationResponse = {
      address: address.toLowerCase(),
      totalVotes: votes.length,
      protocols: Array.from(protocolSet),
      votes: votes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      byProtocol,
      participationScore,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching governance participation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch governance participation', details: error.message },
      { status: 500 }
    );
  }
}

