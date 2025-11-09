import { goldrushClient } from './client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import type { GoldRushNFT } from '@airdrop-finder/shared';

interface NFTResponse {
  data: {
    address: string;
    updated_at: string;
    next_update_at: string;
    quote_currency: string;
    chain_id: number;
    items: Array<{
      contract_address: string;
      contract_name: string;
      contract_ticker_symbol: string;
      contract_display_name: string;
      logo_url: string;
      supports_erc: string[];
      nft_data: Array<{
        token_id: string;
        token_balance: string;
        external_data: {
          name: string;
          description: string;
          image: string;
          image_256: string;
          image_512: string;
          image_1024: string;
          animation_url: string | null;
          external_url: string | null;
          attributes: any[];
        } | null;
      }>;
    }>;
  };
  error: boolean;
  error_message: string | null;
  error_code: number | null;
}

/**
 * Fetch NFTs owned by a wallet address on a specific chain
 */
export async function fetchNFTs(
  address: string,
  chainName: string
): Promise<GoldRushNFT[]> {
  try {
    const response = await goldrushClient.get<NFTResponse>(
      `/${chainName}/address/${address}/balances_nft/`
    );

    if (response.error) {
      console.error(`Error fetching NFTs for ${chainName}:`, response.error_message);
      return [];
    }

    const nfts: GoldRushNFT[] = [];

    response.data.items.forEach((contract) => {
      contract.nft_data.forEach((nft) => {
        nfts.push({
          contract_address: contract.contract_address,
          token_id: nft.token_id,
          token_balance: nft.token_balance,
          external_data: nft.external_data ? {
            name: nft.external_data.name,
            image: nft.external_data.image,
          } : undefined,
        });
      });
    });

    return nfts;
  } catch (error) {
    console.error(`Failed to fetch NFTs for ${chainName}:`, error);
    return [];
  }
}

/**
 * Fetch NFTs across all supported chains
 */
export async function fetchAllChainNFTs(
  address: string
): Promise<Record<number, GoldRushNFT[]>> {
  const results: Record<number, GoldRushNFT[]> = {};

  const promises = SUPPORTED_CHAINS.map(async (chain) => {
    const nfts = await fetchNFTs(address, chain.goldrushName);
    return { chainId: chain.id, nfts };
  });

  const chainResults = await Promise.all(promises);

  chainResults.forEach(({ chainId, nfts }) => {
    results[chainId] = nfts;
  });

  return results;
}

/**
 * Get unique NFT contract addresses
 */
export function getUniqueNFTContracts(nfts: GoldRushNFT[]): Set<string> {
  const contracts = new Set<string>();
  nfts.forEach((nft) => {
    contracts.add(nft.contract_address.toLowerCase());
  });
  return contracts;
}

/**
 * Check if address has NFTs from specific platforms
 */
export function hasNFTsFromPlatform(
  nfts: GoldRushNFT[],
  platformContracts: string[]
): boolean {
  const contractAddresses = new Set(
    nfts.map((nft) => nft.contract_address.toLowerCase())
  );

  return platformContracts.some((contract) =>
    contractAddresses.has(contract.toLowerCase())
  );
}

/**
 * Count total NFTs owned
 */
export function getTotalNFTCount(chainNFTs: Record<number, GoldRushNFT[]>): number {
  return Object.values(chainNFTs).reduce((total, nfts) => total + nfts.length, 0);
}

