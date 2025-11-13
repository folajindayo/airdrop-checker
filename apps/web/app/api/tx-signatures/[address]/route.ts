import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface TransactionSignature {
  chainId: number;
  chainName: string;
  transactionHash: string;
  functionSignature: string;
  functionName: string;
  parameters: Array<{
    name: string;
    type: string;
    value: string;
  }>;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed';
  timestamp: string;
}

interface SignatureAnalysis {
  signature: string;
  functionName: string;
  callCount: number;
  totalGasUsed: string;
  successRate: number;
  chains: string[];
  lastUsed: string;
}

interface TransactionSignatureResponse {
  address: string;
  totalTransactions: number;
  uniqueSignatures: number;
  signatures: TransactionSignature[];
  analysis: SignatureAnalysis[];
  topSignatures: SignatureAnalysis[];
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: TransactionSignatureResponse; expires: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `tx-signatures:${address.toLowerCase()}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const signatures: TransactionSignature[] = [];
    const signatureMap: Record<string, SignatureAnalysis> = {};

    // Fetch transactions from all chains
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
            if (tx.log_events && tx.log_events.length > 0) {
              for (const log of tx.log_events) {
                if (log.decoded) {
                  const funcName = log.decoded.name || 'Unknown';
                  const funcSig = log.topics?.[0] || '';
                  
                  // Extract parameters
                  const parameters = (log.decoded.params || []).map((p: any) => ({
                    name: p.name || 'unknown',
                    type: p.type || 'unknown',
                    value: p.value?.toString() || '',
                  }));

                  const sigKey = funcSig || funcName;
                  
                  signatures.push({
                    chainId: chain.id,
                    chainName: chain.name,
                    transactionHash: tx.tx_hash,
                    functionSignature: funcSig,
                    functionName: funcName,
                    parameters,
                    gasUsed: tx.gas_spent?.toString() || '0',
                    gasPrice: tx.gas_price?.toString() || '0',
                    status: tx.successful ? 'success' : 'failed',
                    timestamp: tx.block_signed_at,
                  });

                  // Track signature analysis
                  if (!signatureMap[sigKey]) {
                    signatureMap[sigKey] = {
                      signature: funcSig,
                      functionName: funcName,
                      callCount: 0,
                      totalGasUsed: '0',
                      successRate: 0,
                      chains: [],
                      lastUsed: tx.block_signed_at,
                    };
                  }

                  signatureMap[sigKey].callCount++;
                  signatureMap[sigKey].totalGasUsed = (
                    BigInt(signatureMap[sigKey].totalGasUsed) + BigInt(tx.gas_spent || 0)
                  ).toString();
                  
                  if (!signatureMap[sigKey].chains.includes(chain.name)) {
                    signatureMap[sigKey].chains.push(chain.name);
                  }
                  
                  if (tx.block_signed_at > signatureMap[sigKey].lastUsed) {
                    signatureMap[sigKey].lastUsed = tx.block_signed_at;
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching transaction signatures for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Calculate success rates
    const analysis: SignatureAnalysis[] = Object.values(signatureMap).map(sig => {
      const sigTxs = signatures.filter(s => 
        s.functionSignature === sig.signature || s.functionName === sig.functionName
      );
      const successful = sigTxs.filter(s => s.status === 'success').length;
      const successRate = sigTxs.length > 0 ? (successful / sigTxs.length) * 100 : 0;

      return {
        ...sig,
        successRate: Math.round(successRate * 100) / 100,
      };
    });

    const topSignatures = analysis
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, 10);

    const result: TransactionSignatureResponse = {
      address: address.toLowerCase(),
      totalTransactions: signatures.length,
      uniqueSignatures: analysis.length,
      signatures: signatures.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      analysis,
      topSignatures,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error analyzing transaction signatures:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transaction signatures', details: error.message },
      { status: 500 }
    );
  }
}

