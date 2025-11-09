'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading = false,
  threshold = 0.8,
  loader,
  endMessage,
  className,
  itemClassName,
}: InfiniteScrollProps<T>) {
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  React.useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          loadMore().finally(() => {
            setIsLoadingMore(false);
          });
        }
      },
      { threshold }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, loadMore, threshold]);

  return (
    <div className={cn('w-full', className)}>
      {items.map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}

      {hasMore && (
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {loader || (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && !loading && endMessage && (
        <div className="py-8 text-center text-muted-foreground">
          {endMessage}
        </div>
      )}
    </div>
  );
}

// Infinite scroll with manual load button
export function InfiniteScrollWithButton<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading = false,
  className,
  itemClassName,
}: InfiniteScrollProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  };

  return (
    <div className={cn('w-full', className)}>
      {items.map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}

      {hasMore && (
        <div className="py-4 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {!hasMore && !loading && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No more items to load
        </div>
      )}
    </div>
  );
}

// Transaction infinite scroll
export function InfiniteTransactionList({
  initialTransactions,
  loadMoreTransactions,
  hasMore,
  className,
}: {
  initialTransactions: Array<{
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: Date;
    status: 'success' | 'failed' | 'pending';
  }>;
  loadMoreTransactions: () => Promise<void>;
  hasMore: boolean;
  className?: string;
}) {
  const [transactions, setTransactions] = React.useState(initialTransactions);

  const loadMore = async () => {
    await loadMoreTransactions();
    // In real implementation, new transactions would be appended to state
  };

  return (
    <InfiniteScroll
      items={transactions}
      loadMore={loadMore}
      hasMore={hasMore}
      className={className}
      itemClassName="mb-3"
      renderItem={(tx) => (
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded font-medium',
                    tx.status === 'success' && 'bg-green-500/10 text-green-500',
                    tx.status === 'failed' && 'bg-red-500/10 text-red-500',
                    tx.status === 'pending' && 'bg-yellow-500/10 text-yellow-500'
                  )}
                >
                  {tx.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tx.timestamp.toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-mono text-muted-foreground truncate">
                {tx.hash}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold">{tx.value} ETH</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">From: </span>
              <span className="font-mono">
                {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">To: </span>
              <span className="font-mono">
                {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      )}
      endMessage={<p className="text-sm">All transactions loaded</p>}
    />
  );
}

// Airdrop feed with infinite scroll
export function InfiniteAirdropFeed({
  initialAirdrops,
  loadMoreAirdrops,
  hasMore,
  className,
}: {
  initialAirdrops: Array<{
    id: string;
    name: string;
    description: string;
    status: 'active' | 'upcoming' | 'ended';
    chain: string;
    score: number;
    logoUrl?: string;
  }>;
  loadMoreAirdrops: () => Promise<void>;
  hasMore: boolean;
  className?: string;
}) {
  const [airdrops, setAirdrops] = React.useState(initialAirdrops);

  return (
    <InfiniteScroll
      items={airdrops}
      loadMore={loadMoreAirdrops}
      hasMore={hasMore}
      className={className}
      itemClassName="mb-4"
      renderItem={(airdrop) => (
        <div className="border rounded-lg p-5 bg-card hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            {airdrop.logoUrl && (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={airdrop.logoUrl}
                  alt={airdrop.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{airdrop.name}</h3>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded font-medium',
                    airdrop.status === 'active' && 'bg-green-500/10 text-green-500',
                    airdrop.status === 'upcoming' &&
                      'bg-blue-500/10 text-blue-500',
                    airdrop.status === 'ended' && 'bg-gray-500/10 text-gray-500'
                  )}
                >
                  {airdrop.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {airdrop.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Chain: {airdrop.chain}</span>
                <span>•</span>
                <span>Eligibility Score: {airdrop.score}/100</span>
              </div>
            </div>
          </div>
        </div>
      )}
      endMessage={<p className="text-sm">You've seen all airdrops!</p>}
    />
  );
}

// Grid infinite scroll for NFTs
export function InfiniteNFTGrid({
  initialNFTs,
  loadMoreNFTs,
  hasMore,
  className,
}: {
  initialNFTs: Array<{
    id: string;
    name: string;
    image: string;
    collection: string;
    price?: string;
  }>;
  loadMoreNFTs: () => Promise<void>;
  hasMore: boolean;
  className?: string;
}) {
  const [nfts, setNFTs] = React.useState(initialNFTs);

  return (
    <InfiniteScroll
      items={nfts}
      loadMore={loadMoreNFTs}
      hasMore={hasMore}
      className={className}
      renderItem={(nft) => (
        <div className="border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="aspect-square bg-muted relative">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <h4 className="font-semibold text-sm truncate mb-1">{nft.name}</h4>
            <p className="text-xs text-muted-foreground truncate mb-2">
              {nft.collection}
            </p>
            {nft.price && (
              <p className="text-sm font-medium">{nft.price} ETH</p>
            )}
          </div>
        </div>
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Items will be rendered here */}
      </div>
    </InfiniteScroll>
  );
}

// Skeleton loader for infinite scroll
export function InfiniteScrollSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

