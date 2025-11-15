'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import {
  Image as ImageIcon,
  Grid,
  List,
  Filter,
  TrendingUp,
  ExternalLink,
  Search,
  DollarSign,
  Award,
  Eye,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';

interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  description?: string;
  image: string;
  collection: string;
  chain: string;
  chainId: number;
  floorPrice?: number;
  lastSale?: number;
  rarity?: string;
  traits?: { trait_type: string; value: string }[];
  externalUrl?: string;
}

interface Collection {
  address: string;
  name: string;
  chain: string;
  nftCount: number;
  floorPrice?: number;
  totalValue?: number;
  logo?: string;
}

interface NFTPortfolioData {
  totalNFTs: number;
  totalCollections: number;
  totalValue: number;
  nfts: NFT[];
  collections: Collection[];
  chainDistribution: { chain: string; count: number; value: number }[];
}

interface NFTPortfolioTrackerProps {
  address: string;
}

export function NFTPortfolioTracker({ address }: NFTPortfolioTrackerProps) {
  const [data, setData] = useState<NFTPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'value' | 'name'>('recent');

  useEffect(() => {
    if (address) {
      fetchNFTPortfolio();
    }
  }, [address]);

  async function fetchNFTPortfolio() {
    setLoading(true);
    try {
      const response = await fetch(`/api/nft-portfolio/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching NFT portfolio:', error);
      toast.error('Failed to load NFT portfolio');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No NFT portfolio data available</p>
      </Card>
    );
  }

  // Filter NFTs
  const filteredNFTs = data.nfts.filter((nft) => {
    const matchesChain = selectedChain === 'all' || nft.chain === selectedChain;
    const matchesSearch =
      searchQuery === '' ||
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChain && matchesSearch;
  });

  // Sort NFTs
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    if (sortBy === 'value') {
      return (b.floorPrice || 0) - (a.floorPrice || 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0; // recent (default order)
  });

  const chains = ['all', ...new Set(data.nfts.map((nft) => nft.chain))];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total NFTs</p>
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.totalNFTs}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Collections</p>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{data.totalCollections}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">
            ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg. Floor Price</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">
            ${(data.totalValue / data.totalNFTs).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Collections Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Collections</h3>
        <div className="space-y-3">
          {data.collections.slice(0, 5).map((collection) => (
            <div
              key={collection.address}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {collection.logo ? (
                  <img
                    src={collection.logo}
                    alt={collection.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {collection.name.substring(0, 2)}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{collection.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {collection.nftCount} NFTs · {collection.chain}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${(collection.totalValue || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Floor: ${(collection.floorPrice || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search NFTs or collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="px-3 py-2 bg-background border rounded-md text-sm"
            >
              {chains.map((chain) => (
                <option key={chain} value={chain}>
                  {chain === 'all' ? 'All Chains' : chain}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-background border rounded-md text-sm"
            >
              <option value="recent">Recent</option>
              <option value="value">Value</option>
              <option value="name">Name</option>
            </select>

            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* NFT Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedNFTs.map((nft) => (
            <Card key={`${nft.contractAddress}-${nft.tokenId}`} className="overflow-hidden group">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/400?text=NFT';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                    {nft.chain}
                  </Badge>
                </div>
                {nft.rarity && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="backdrop-blur-sm bg-background/80">
                      {nft.rarity}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{nft.collection}</p>
                <h4 className="font-semibold mb-2 truncate">{nft.name}</h4>
                {nft.floorPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Floor</span>
                    <span className="font-semibold">${nft.floorPrice.toFixed(2)}</span>
                  </div>
                )}
                {nft.externalUrl && (
                  <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                    <a href={nft.externalUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNFTs.map((nft) => (
            <Card
              key={`${nft.contractAddress}-${nft.tokenId}`}
              className="p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="h-20 w-20 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/80?text=NFT';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{nft.name}</h4>
                    <Badge variant="secondary">{nft.chain}</Badge>
                    {nft.rarity && <Badge variant="outline">{nft.rarity}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{nft.collection}</p>
                  {nft.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {nft.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {nft.floorPrice && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground">Floor Price</p>
                      <p className="font-semibold">${nft.floorPrice.toFixed(2)}</p>
                    </div>
                  )}
                  {nft.externalUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={nft.externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {sortedNFTs.length === 0 && (
        <Card className="p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No NFTs found matching your filters</p>
        </Card>
      )}
    </div>
  );
}

