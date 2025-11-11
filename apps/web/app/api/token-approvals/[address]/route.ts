import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';

interface TokenApproval {
  chainId: number;
  chainName: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  spenderAddress: string;
  spenderName: string;
  amount: string;
  amountFormatted: string;
  isUnlimited: boolean;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
}

interface TokenApprovalsResponse {
  address: string;
  totalApprovals: number;
  activeApprovals: number;
  unlimitedApprovals: number;
  approvals: TokenApproval[];
  byToken: Record<string, {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    approvalCount: number;
    approvals: TokenApproval[];
  }>;
  bySpender: Record<string, {
    spenderAddress: string;
    spenderName: string;
    approvalCount: number;
    totalAmount: string;
    approvals: TokenApproval[];
  }>;
  riskScore: number;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: TokenApprovalsResponse; expires: number }>();

// ERC20 Approval event signature
const APPROVAL_EVENT_SIGNATURE = '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0';

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
    const cacheKey = `token-approvals:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const approvals: TokenApproval[] = [];
    const addressLower = address.toLowerCase();
    let unlimitedCount = 0;

    // Fetch approvals from all chains
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
                // Check for Approval events
                if (log.decoded && 
                    (log.decoded.name === 'Approval' || log.topics?.[0] === APPROVAL_EVENT_SIGNATURE)) {
                  
                  const owner = log.decoded.params?.find((p: any) => p.name === 'owner')?.value?.toLowerCase();
                  const spender = log.decoded.params?.find((p: any) => p.name === 'spender')?.value?.toLowerCase();
                  const amount = log.decoded.params?.find((p: any) => p.name === 'value' || p.name === 'amount')?.value || '0';

                  if (owner === addressLower) {
                    const tokenInfo = {
                      address: log.sender_address || '',
                      symbol: log.sender_contract_ticker_symbol || 'Unknown',
                      name: log.sender_contract_label || log.sender_contract_ticker_symbol || 'Unknown Token',
                      decimals: log.sender_contract_decimals || 18,
                    };

                    const decimals = tokenInfo.decimals;
                    const amountBigInt = BigInt(amount);
                    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
                    const isUnlimited = amountBigInt >= maxUint256 - BigInt(1000); // Allow for some margin
                    
                    if (isUnlimited) {
                      unlimitedCount++;
                    }

                    const amountFormatted = isUnlimited 
                      ? 'Unlimited'
                      : formatUnits(amountBigInt, decimals);

                    approvals.push({
                      chainId: chain.id,
                      chainName: chain.name,
                      tokenAddress: tokenInfo.address,
                      tokenSymbol: tokenInfo.symbol,
                      tokenName: tokenInfo.name,
                      spenderAddress: spender || '',
                      spenderName: tx.to_address_label || 'Unknown',
                      amount: amount,
                      amountFormatted,
                      isUnlimited,
                      transactionHash: tx.tx_hash,
                      blockNumber: tx.block_height,
                      timestamp: tx.block_signed_at,
                    });
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching token approvals for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by token
    const byToken: Record<string, any> = {};
    for (const approval of approvals) {
      const tokenKey = approval.tokenAddress || 'unknown';
      if (!byToken[tokenKey]) {
        byToken[tokenKey] = {
          tokenAddress: approval.tokenAddress,
          tokenSymbol: approval.tokenSymbol,
          tokenName: approval.tokenName,
          approvalCount: 0,
          approvals: [],
        };
      }
      byToken[tokenKey].approvalCount++;
      byToken[tokenKey].approvals.push(approval);
    }

    // Group by spender
    const bySpender: Record<string, any> = {};
    for (const approval of approvals) {
      const spenderKey = approval.spenderAddress || 'unknown';
      if (!bySpender[spenderKey]) {
        bySpender[spenderKey] = {
          spenderAddress: approval.spenderAddress,
          spenderName: approval.spenderName,
          approvalCount: 0,
          totalAmount: '0',
          approvals: [],
        };
      }
      bySpender[spenderKey].approvalCount++;
      if (!approval.isUnlimited) {
        bySpender[spenderKey].totalAmount = (
          BigInt(bySpender[spenderKey].totalAmount) + BigInt(approval.amount)
        ).toString();
      }
      bySpender[spenderKey].approvals.push(approval);
    }

    // Calculate risk score (0-100, higher = more risky)
    // Factors: unlimited approvals, number of approvals, unknown spenders
    let riskScore = 0;
    riskScore += Math.min(unlimitedCount * 20, 60); // Up to 60 points for unlimited approvals
    riskScore += Math.min(approvals.length * 2, 30); // Up to 30 points for many approvals
    const unknownSpenders = Object.values(bySpender).filter((s: any) => 
      s.spenderName === 'Unknown' || !s.spenderName
    ).length;
    riskScore += Math.min(unknownSpenders * 5, 10); // Up to 10 points for unknown spenders
    riskScore = Math.min(riskScore, 100);

    const result: TokenApprovalsResponse = {
      address: addressLower,
      totalApprovals: approvals.length,
      activeApprovals: approvals.length, // Simplified - would need current allowance checks
      unlimitedApprovals: unlimitedCount,
      approvals: approvals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      byToken,
      bySpender,
      riskScore,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching token approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token approvals', details: error.message },
      { status: 500 }
    );
  }
}

