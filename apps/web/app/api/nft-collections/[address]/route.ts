import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface NFTCollection {
  chainId: number;
  chainName: string;
  contractAddress: string;
  contractName: string;
  contractSymbol: string;
  tokenType: string;
  totalSupply: number;
  nftCount: number;
  floorPrice?: number;
  floorPriceUSD?: number;
  totalValueUSD?: number;
}

interface NFTCollectionsResponse {
  address: string;
  totalNFTs: number;
  totalCollections: number;
  totalValueUSD: number;
  collections: NFTCollection[];
  byChain: Record<string, {
    chainId: number;
    chainName: string;
    nftCount: number;
    collectionCount: number;
    collections: NFTCollection[];
  }>;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: NFTCollectionsResponse; expires: number }>();

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
    const cacheKey = `nft-collections:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const collections: NFTCollection[] = [];
    let totalNFTs = 0;
    let totalValueUSD = 0;

    // Fetch NFT collections from all chains
    for (const chain of CHAINS) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        const response = await goldrushClient.get(
          `/v2/${chainName}/address/${address}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'nft': true,
            'no-spam': true,
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          const chainCollections: Record<string, NFTCollection> = {};
          
          for (const item of response.data.items) {
            if (item.type === 'nft') {
              const contractAddress = item.contract_address?.toLowerCase() || '';
              
              if (!chainCollections[contractAddress]) {
                chainCollections[contractAddress] = {
                  chainId: chain.id,
                  chainName: chain.name,
                  contractAddress: contractAddress,
                  contractName: item.contract_name || 'Unknown',
                  contractSymbol: item.contract_ticker_symbol || '',
                  tokenType: item.supports_erc || 'ERC-721',
                  totalSupply: item.total_supply || 0,
                  nftCount: 0,
                  floorPrice: undefined,
                  floorPriceUSD: undefined,
                  totalValueUSD: 0,
                };
              }

              const nftCount = parseInt(item.balance || '0', 10);
              chainCollections[contractAddress].nftCount += nftCount;
              totalNFTs += nftCount;

              const usdValue = parseFloat(item.quote || '0');
              chainCollections[contractAddress].totalValueUSD = 
                (chainCollections[contractAddress].totalValueUSD || 0) + usdValue;
              totalValueUSD += usdValue;
            }
          }

          collections.push(...Object.values(chainCollections));
        }
      } catch (error) {
        console.error(`Error fetching NFT collections for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    // Group by chain
    const byChain: Record<string, any> = {};
    for (const collection of collections) {
      const chainKey = collection.chainName;
      if (!byChain[chainKey]) {
        byChain[chainKey] = {
          chainId: collection.chainId,
          chainName: collection.chainName,
          nftCount: 0,
          collectionCount: 0,
          collections: [],
        };
      }
      byChain[chainKey].nftCount += collection.nftCount;
      byChain[chainKey].collectionCount += 1;
      byChain[chainKey].collections.push(collection);
    }

    const result: NFTCollectionsResponse = {
      address: address.toLowerCase(),
      totalNFTs,
      totalCollections: collections.length,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      collections: collections.sort((a, b) => (b.totalValueUSD || 0) - (a.totalValueUSD || 0)),
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
    console.error('Error fetching NFT collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT collections', details: error.message },
      { status: 500 }
    );
  }
}

