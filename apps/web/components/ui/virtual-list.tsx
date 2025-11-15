'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  loading?: boolean;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  className,
  loading = false,
  onEndReached,
  endReachedThreshold = 0.8,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Check if we've reached the end
    if (onEndReached) {
      const scrollPercentage =
        (target.scrollTop + target.clientHeight) / target.scrollHeight;
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%',
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
      {loading && (
        <div className="p-4">
          <Skeleton className="h-12 w-full" />
        </div>
      )}
    </div>
  );
}

// Transaction list with virtual scrolling
export function VirtualTransactionList({
  transactions,
  className,
}: {
  transactions: Array<{
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: Date;
  }>;
  className?: string;
}) {
  return (
    <VirtualList
      items={transactions}
      height={600}
      itemHeight={80}
      className={className}
      renderItem={(tx) => (
        <Card className="p-4 h-full flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground truncate">
                {tx.hash.slice(0, 10)}...
              </span>
              <span className="text-xs text-muted-foreground">
                {tx.timestamp.toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">From: </span>
              <span className="font-mono">
                {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{tx.value} ETH</p>
          </div>
        </Card>
      )}
    />
  );
}

// Airdrop list with virtual scrolling
export function VirtualAirdropList({
  airdrops,
  onEndReached,
  loading,
  className,
}: {
  airdrops: Array<{
    id: string;
    name: string;
    status: string;
    score: number;
    chain: string;
  }>;
  onEndReached?: () => void;
  loading?: boolean;
  className?: string;
}) {
  return (
    <VirtualList
      items={airdrops}
      height={500}
      itemHeight={100}
      onEndReached={onEndReached}
      loading={loading}
      className={className}
      renderItem={(airdrop) => (
        <Card className="p-4 h-full flex items-center justify-between">
          <div>
            <h4 className="font-semibold">{airdrop.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{airdrop.chain}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  airdrop.status === 'active' && 'bg-green-500/10 text-green-500',
                  airdrop.status === 'upcoming' && 'bg-blue-500/10 text-blue-500',
                  airdrop.status === 'ended' && 'bg-gray-500/10 text-gray-500'
                )}
              >
                {airdrop.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{airdrop.score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </Card>
      )}
    />
  );
}

// Variable height virtual list (for dynamic content)
export interface VariableVirtualListProps<T> {
  items: T[];
  height: number;
  estimateItemHeight: (index: number) => number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VariableVirtualList<T>({
  items,
  height,
  estimateItemHeight,
  renderItem,
  overscan = 3,
  className,
}: VariableVirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [itemHeights, setItemHeights] = React.useState<Map<number, number>>(
    new Map()
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  // Measure item heights
  React.useEffect(() => {
    const newHeights = new Map<number, number>();
    itemRefs.current.forEach((ref, index) => {
      if (ref) {
        newHeights.set(index, ref.getBoundingClientRect().height);
      }
    });
    setItemHeights(newHeights);
  }, [items]);

  const getItemHeight = (index: number) => {
    return itemHeights.get(index) || estimateItemHeight(index);
  };

  const getItemOffset = (index: number) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  };

  const totalHeight = items.reduce(
    (sum, _, index) => sum + getItemHeight(index),
    0
  );

  // Find visible range
  let startIndex = 0;
  let currentOffset = 0;
  while (currentOffset < scrollTop && startIndex < items.length) {
    currentOffset += getItemHeight(startIndex);
    startIndex++;
  }
  startIndex = Math.max(0, startIndex - overscan);

  let endIndex = startIndex;
  currentOffset = getItemOffset(startIndex);
  while (currentOffset < scrollTop + height && endIndex < items.length) {
    currentOffset += getItemHeight(endIndex);
    endIndex++;
  }
  endIndex = Math.min(items.length - 1, endIndex + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={actualIndex}
              ref={(ref) => {
                if (ref) {
                  itemRefs.current.set(actualIndex, ref);
                }
              }}
              style={{
                position: 'absolute',
                top: getItemOffset(actualIndex),
                width: '100%',
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Grid virtual list
export interface VirtualGridProps<T> {
  items: T[];
  height: number;
  itemWidth: number;
  itemHeight: number;
  columns: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  height,
  itemWidth,
  itemHeight,
  columns,
  gap = 16,
  renderItem,
  overscan = 1,
  className,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + height) / rowHeight) + overscan
  );

  const visibleItems: Array<{ item: T; index: number; row: number; col: number }> =
    [];

  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          row,
          col,
        });
      }
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * rowHeight,
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// NFT grid with virtual scrolling
export function VirtualNFTGrid({
  nfts,
  className,
}: {
  nfts: Array<{
    id: string;
    name: string;
    image: string;
    collection: string;
  }>;
  className?: string;
}) {
  return (
    <VirtualGrid
      items={nfts}
      height={600}
      itemWidth={200}
      itemHeight={250}
      columns={3}
      gap={16}
      className={className}
      renderItem={(nft) => (
        <Card className="h-full overflow-hidden">
          <div className="aspect-square bg-muted relative">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <h4 className="font-semibold text-sm truncate">{nft.name}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {nft.collection}
            </p>
          </div>
        </Card>
      )}
    />
  );
}

