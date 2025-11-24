import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Mock NFT portfolio data
    const portfolio = generateMockNFTPortfolio(address);

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('NFT portfolio API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT portfolio' },
      { status: 500 }
    );
  }
}

function generateMockNFTPortfolio(address: string) {
  const collections = [
    {
      address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      name: 'Bored Ape Yacht Club',
      chain: 'Ethereum',
      nftCount: 2,
      floorPrice: 25.5,
      totalValue: 51000,
      logo: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&dpr=1&w=128',
    },
    {
      address: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
      name: 'Mutant Ape Yacht Club',
      chain: 'Ethereum',
      nftCount: 1,
      floorPrice: 8.2,
      totalValue: 8200,
      logo: 'https://i.seadn.io/gae/lHexKRMpw-aoSyB1WdFBff5yfANLReFxHzt1DOj_sg7mS14yARpuvYcUtsyyx-Nkpk6WTcUPFoG53VnLJezYi8hAs0OxNZwlw6Y-dmI?auto=format&dpr=1&w=128',
    },
    {
      address: '0xed5af388653567af2f388e6224dc7c4b3241c544',
      name: 'Azuki',
      chain: 'Ethereum',
      nftCount: 3,
      floorPrice: 12.3,
      totalValue: 36900,
      logo: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=128',
    },
    {
      address: '0x23581767a106ae21c074b2276d25e5c3e136a68b',
      name: 'Moonbirds',
      chain: 'Ethereum',
      nftCount: 1,
      floorPrice: 5.8,
      totalValue: 5800,
      logo: 'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?auto=format&dpr=1&w=128',
    },
    {
      address: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b',
      name: 'CloneX',
      chain: 'Ethereum',
      nftCount: 2,
      floorPrice: 3.2,
      totalValue: 6400,
      logo: 'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?auto=format&dpr=1&w=128',
    },
  ];

  const nfts = [
    {
      tokenId: '1234',
      contractAddress: collections[0].address,
      name: 'Bored Ape #1234',
      description: 'A unique Bored Ape with rare traits',
      image: 'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?auto=format&dpr=1&w=400',
      collection: collections[0].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 25.5,
      lastSale: 28.3,
      rarity: 'Rare',
      externalUrl: 'https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1234',
    },
    {
      tokenId: '5678',
      contractAddress: collections[0].address,
      name: 'Bored Ape #5678',
      description: 'Another unique Bored Ape',
      image: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&dpr=1&w=400',
      collection: collections[0].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 25.5,
      rarity: 'Common',
      externalUrl: 'https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/5678',
    },
    {
      tokenId: '9012',
      contractAddress: collections[1].address,
      name: 'Mutant Ape #9012',
      description: 'A mutated ape with unique characteristics',
      image: 'https://i.seadn.io/gae/lHexKRMpw-aoSyB1WdFBff5yfANLReFxHzt1DOj_sg7mS14yARpuvYcUtsyyx-Nkpk6WTcUPFoG53VnLJezYi8hAs0OxNZwlw6Y-dmI?auto=format&dpr=1&w=400',
      collection: collections[1].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 8.2,
      rarity: 'Epic',
      externalUrl: 'https://opensea.io/assets/ethereum/0x60e4d786628fea6478f785a6d7e704777c86a7c6/9012',
    },
    {
      tokenId: '3456',
      contractAddress: collections[2].address,
      name: 'Azuki #3456',
      description: 'Azuki anime-inspired NFT',
      image: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=400',
      collection: collections[2].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 12.3,
      rarity: 'Legendary',
      externalUrl: 'https://opensea.io/assets/ethereum/0xed5af388653567af2f388e6224dc7c4b3241c544/3456',
    },
    {
      tokenId: '7890',
      contractAddress: collections[2].address,
      name: 'Azuki #7890',
      image: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=400',
      collection: collections[2].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 12.3,
      rarity: 'Rare',
      externalUrl: 'https://opensea.io/assets/ethereum/0xed5af388653567af2f388e6224dc7c4b3241c544/7890',
    },
    {
      tokenId: '2345',
      contractAddress: collections[2].address,
      name: 'Azuki #2345',
      image: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=400',
      collection: collections[2].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 12.3,
      rarity: 'Common',
      externalUrl: 'https://opensea.io/assets/ethereum/0xed5af388653567af2f388e6224dc7c4b3241c544/2345',
    },
    {
      tokenId: '6789',
      contractAddress: collections[3].address,
      name: 'Moonbird #6789',
      description: 'A unique Moonbird NFT',
      image: 'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?auto=format&dpr=1&w=400',
      collection: collections[3].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 5.8,
      rarity: 'Rare',
      externalUrl: 'https://opensea.io/assets/ethereum/0x23581767a106ae21c074b2276d25e5c3e136a68b/6789',
    },
    {
      tokenId: '1111',
      contractAddress: collections[4].address,
      name: 'CloneX #1111',
      description: 'A CloneX avatar',
      image: 'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?auto=format&dpr=1&w=400',
      collection: collections[4].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 3.2,
      rarity: 'Epic',
      externalUrl: 'https://opensea.io/assets/ethereum/0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b/1111',
    },
    {
      tokenId: '2222',
      contractAddress: collections[4].address,
      name: 'CloneX #2222',
      image: 'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?auto=format&dpr=1&w=400',
      collection: collections[4].name,
      chain: 'Ethereum',
      chainId: 1,
      floorPrice: 3.2,
      rarity: 'Common',
      externalUrl: 'https://opensea.io/assets/ethereum/0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b/2222',
    },
  ];

  const totalValue = collections.reduce((sum, col) => sum + (col.totalValue || 0), 0);
  const totalNFTs = nfts.length;
  const totalCollections = collections.length;

  const chainDistribution = [
    {
      chain: 'Ethereum',
      count: nfts.filter((n) => n.chain === 'Ethereum').length,
      value: totalValue,
    },
  ];

  return {
    totalNFTs,
    totalCollections,
    totalValue,
    nfts,
    collections,
    chainDistribution,
  };
}

