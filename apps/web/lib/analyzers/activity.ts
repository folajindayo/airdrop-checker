import type {
  UserActivity,
  ChainActivity,
  ProtocolInteraction,
  NFTActivity,
  BridgeActivity,
  DEXSwap,
  GoldRushTransaction,
  GoldRushNFT,
} from '@airdrop-finder/shared';
import { CHAIN_ID_TO_NAME } from '@airdrop-finder/shared';

/**
 * Known protocol contract addresses (lowercase)
 */
const KNOWN_PROTOCOLS: Record<string, { name: string; type: string }> = {
  // Zora
  '0x7777777f279eba3d3ad8f4e708545291a6fdba8b': { name: 'Zora', type: 'nft' },
  
  // LayerZero / Stargate
  '0x8731d54e9d02c286767d56ac03e8037c07e01e98': { name: 'Stargate', type: 'bridge' },
  '0x66a71dcef29a0ffbdbe3c6a460a3b5bc225cd675': { name: 'LayerZero', type: 'bridge' },
  
  // EigenLayer
  '0x858646372cc42e1a627fce94aa7a7033e7cf075a': { name: 'EigenLayer', type: 'defi' },
  
  // Uniswap
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': { name: 'Uniswap', type: 'dex' },
  '0xe592427a0aece92de3edee1f18e0157c05861564': { name: 'Uniswap', type: 'dex' },
  
  // SushiSwap
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': { name: 'SushiSwap', type: 'dex' },
  
  // Hop Protocol
  '0x3666f603cc164936c1b87e207f36beba4ac5f18a': { name: 'Hop', type: 'bridge' },
  
  // Across Bridge
  '0x4d9079bb4165aeb4084c526a32695dcfd2f77381': { name: 'Across', type: 'bridge' },
};

/**
 * Analyze chain activity from transactions
 */
export function analyzeChainActivity(
  chainTransactions: Record<number, GoldRushTransaction[]>
): ChainActivity[] {
  const activities: ChainActivity[] = [];

  Object.entries(chainTransactions).forEach(([chainIdStr, transactions]) => {
    const chainId = Number(chainIdStr);
    
    if (transactions.length === 0) return;

    const timestamps = transactions
      .map((tx) => new Date(tx.block_signed_at))
      .sort((a, b) => a.getTime() - b.getTime());

    activities.push({
      chainId,
      chainName: CHAIN_ID_TO_NAME[chainId] || `Chain ${chainId}`,
      transactionCount: transactions.length,
      firstActivity: timestamps[0],
      lastActivity: timestamps[timestamps.length - 1],
    });
  });

  return activities;
}

/**
 * Detect protocol interactions from transactions
 */
export function detectProtocolInteractions(
  chainTransactions: Record<number, GoldRushTransaction[]>
): ProtocolInteraction[] {
  const interactionMap = new Map<string, ProtocolInteraction>();

  Object.entries(chainTransactions).forEach(([chainIdStr, transactions]) => {
    const chainId = Number(chainIdStr);

    transactions.forEach((tx) => {
      const toAddress = tx.to_address?.toLowerCase();
      
      if (!toAddress) return;

      const protocol = KNOWN_PROTOCOLS[toAddress];
      
      if (protocol) {
        const key = `${protocol.name}-${toAddress}-${chainId}`;
        
        if (interactionMap.has(key)) {
          const existing = interactionMap.get(key)!;
          existing.interactionCount++;
          
          const txDate = new Date(tx.block_signed_at);
          if (!existing.firstInteraction || txDate < existing.firstInteraction) {
            existing.firstInteraction = txDate;
          }
          if (!existing.lastInteraction || txDate > existing.lastInteraction) {
            existing.lastInteraction = txDate;
          }
        } else {
          interactionMap.set(key, {
            protocol: protocol.name,
            contractAddress: toAddress,
            chainId,
            interactionCount: 1,
            firstInteraction: new Date(tx.block_signed_at),
            lastInteraction: new Date(tx.block_signed_at),
          });
        }
      }
    });
  });

  return Array.from(interactionMap.values());
}

/**
 * Analyze NFT activity
 */
export function analyzeNFTActivity(
  chainNFTs: Record<number, GoldRushNFT[]>
): NFTActivity[] {
  const activities: NFTActivity[] = [];

  Object.entries(chainNFTs).forEach(([chainIdStr, nfts]) => {
    const chainId = Number(chainIdStr);

    nfts.forEach((nft) => {
      activities.push({
        contractAddress: nft.contract_address,
        tokenId: nft.token_id,
        chainId,
        type: 'mint', // Simplified - in real scenario would need transaction analysis
      });
    });
  });

  return activities;
}

/**
 * Detect bridge activity
 */
export function detectBridgeActivity(
  protocolInteractions: ProtocolInteraction[]
): BridgeActivity[] {
  const bridgeMap = new Map<string, BridgeActivity>();

  protocolInteractions.forEach((interaction) => {
    const protocol = KNOWN_PROTOCOLS[interaction.contractAddress];
    
    if (protocol && protocol.type === 'bridge') {
      const key = interaction.protocol;
      
      if (bridgeMap.has(key)) {
        const existing = bridgeMap.get(key)!;
        existing.count += interaction.interactionCount;
        
        if (
          interaction.lastInteraction &&
          (!existing.lastBridge || interaction.lastInteraction > existing.lastBridge)
        ) {
          existing.lastBridge = interaction.lastInteraction;
        }
      } else {
        bridgeMap.set(key, {
          bridge: interaction.protocol,
          fromChain: interaction.chainId,
          toChain: 0, // Would need more analysis to determine
          count: interaction.interactionCount,
          lastBridge: interaction.lastInteraction,
        });
      }
    }
  });

  return Array.from(bridgeMap.values());
}

/**
 * Detect DEX swap activity
 */
export function detectDEXActivity(
  protocolInteractions: ProtocolInteraction[]
): DEXSwap[] {
  const dexMap = new Map<string, DEXSwap>();

  protocolInteractions.forEach((interaction) => {
    const protocol = KNOWN_PROTOCOLS[interaction.contractAddress];
    
    if (protocol && protocol.type === 'dex') {
      const key = `${interaction.protocol}-${interaction.chainId}`;
      
      if (dexMap.has(key)) {
        const existing = dexMap.get(key)!;
        existing.count += interaction.interactionCount;
        
        if (
          interaction.lastInteraction &&
          (!existing.lastSwap || interaction.lastInteraction > existing.lastSwap)
        ) {
          existing.lastSwap = interaction.lastInteraction;
        }
      } else {
        dexMap.set(key, {
          dex: interaction.protocol,
          chainId: interaction.chainId,
          count: interaction.interactionCount,
          lastSwap: interaction.lastInteraction,
        });
      }
    }
  });

  return Array.from(dexMap.values());
}

/**
 * Aggregate all user activity
 */
export function aggregateUserActivity(
  address: string,
  chainTransactions: Record<number, GoldRushTransaction[]>,
  chainNFTs: Record<number, GoldRushNFT[]>
): UserActivity {
  const chains = analyzeChainActivity(chainTransactions);
  const protocols = detectProtocolInteractions(chainTransactions);
  const nfts = analyzeNFTActivity(chainNFTs);
  const bridges = detectBridgeActivity(protocols);
  const dexSwaps = detectDEXActivity(protocols);

  return {
    address,
    chains,
    protocols,
    nfts,
    tokens: [], // Would be filled with token balance data
    bridges,
    dexSwaps,
  };
}

