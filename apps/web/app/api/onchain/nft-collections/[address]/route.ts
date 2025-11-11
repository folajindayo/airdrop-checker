import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/nft-collections/[address]
 * Get NFT collections owned by a wallet address
 * Uses GoldRush API for NFT data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-nft-collections:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const collections: any[] = [];
    const nftItems: any[] = [];

    for (const chain of targetChains) {
      try {
        // Fetch NFT balances from GoldRush
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/balances_nft/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'nft': 'true',
            'no-spam': 'true',
            'page-size': limit,
          }
        );

        if (response.data?.items) {
          const items = response.data.items;
          
          // Group by collection
          const collectionMap = new Map<string, any>();
          
          items.forEach((item: any) => {
            const contractAddress = item.contract_address?.toLowerCase();
            if (!contractAddress) return;

            if (!collectionMap.has(contractAddress)) {
              collectionMap.set(contractAddress, {
                chainId: chain.id,
                chainName: chain.name,
                contractAddress,
                contractName: item.contract_name || 'Unknown',
                contractTickerSymbol: item.contract_ticker_symbol || 'NFT',
                logoUrl: item.logo_url,
                totalSupply: item.total_supply,
                nftData: [],
                totalCount: 0,
                totalValue: 0,
              });
            }

            const collection = collectionMap.get(contractAddress)!;
            collection.nftData.push({
              tokenId: item.token_id,
              tokenUrl: item.token_url,
              type: item.type,
              lastTransferDate: item.last_transfer_date,
            });
            collection.totalCount += 1;
            if (item.quote) {
              collection.totalValue += item.quote;
            }
          });

          collections.push(...Array.from(collectionMap.values()));
          nftItems.push(...items.map((item: any) => ({
            chainId: chain.id,
            chainName: chain.name,
            ...item,
          })));
        }
      } catch (error) {
        console.error(`Error fetching NFTs on ${chain.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      collections,
      nftItems,
      totalCollections: collections.length,
      totalNFTs: nftItems.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain NFT collections API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch NFT collections',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

