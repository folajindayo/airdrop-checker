export type ProtocolCategory =
  | 'dex'
  | 'bridge'
  | 'defi'
  | 'restaking'
  | 'nft'
  | 'infrastructure'
  | 'tooling'
  | 'other';

export interface ProtocolMetadata {
  name: string;
  category: ProtocolCategory;
  tags?: string[];
}

/**
 * Known protocol contract addresses (lowercase)
 * This list focuses on key protocols relevant for airdrop farming activities.
 */
export const KNOWN_PROTOCOLS: Record<string, ProtocolMetadata> = {
  // Zora
  '0x7777777f279eba3d3ad8f4e708545291a6fdba8b': {
    name: 'Zora',
    category: 'nft',
    tags: ['creator', 'mint'],
  },

  // LayerZero / Stargate
  '0x8731d54e9d02c286767d56ac03e8037c07e01e98': {
    name: 'Stargate',
    category: 'bridge',
    tags: ['cross-chain', 'omnichain'],
  },
  '0x66a71dcef29a0ffbdbe3c6a460a3b5bc225cd675': {
    name: 'LayerZero',
    category: 'bridge',
    tags: ['infrastructure', 'messaging'],
  },

  // EigenLayer
  '0x858646372cc42e1a627fce94aa7a7033e7cf075a': {
    name: 'EigenLayer',
    category: 'restaking',
    tags: ['defi', 'staking'],
  },

  // Uniswap
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': {
    name: 'Uniswap',
    category: 'dex',
    tags: ['swap', 'lp'],
  },
  '0xe592427a0aece92de3edee1f18e0157c05861564': {
    name: 'Uniswap',
    category: 'dex',
    tags: ['swap', 'router'],
  },

  // SushiSwap
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': {
    name: 'SushiSwap',
    category: 'dex',
    tags: ['swap', 'multichain'],
  },

  // Hop Protocol
  '0x3666f603cc164936c1b87e207f36beba4ac5f18a': {
    name: 'Hop',
    category: 'bridge',
    tags: ['cross-chain', 'bridge'],
  },

  // Across Bridge
  '0x4d9079bb4165aeb4084c526a32695dcfd2f77381': {
    name: 'Across',
    category: 'bridge',
    tags: ['bridge', 'liquidity'],
  },
};

export const CATEGORY_LABELS: Record<ProtocolCategory, string> = {
  dex: 'Decentralized Exchange',
  bridge: 'Bridge / Interop',
  defi: 'DeFi Protocol',
  restaking: 'Restaking',
  nft: 'NFT / Creator',
  infrastructure: 'Infrastructure',
  tooling: 'Tooling',
  other: 'Other',
};

export function getProtocolMetadata(address?: string | null): ProtocolMetadata | null {
  if (!address) return null;
  return KNOWN_PROTOCOLS[address.toLowerCase()] ?? null;
}

export function getCategoryLabel(category: ProtocolCategory): string {
  return CATEGORY_LABELS[category] ?? CATEGORY_LABELS.other;
}



