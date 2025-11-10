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
import { KNOWN_PROTOCOLS } from './protocols';

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
    
    if (protocol && protocol.category === 'bridge') {
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
    
    if (protocol && protocol.category === 'dex') {
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

