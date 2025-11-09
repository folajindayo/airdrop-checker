'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface MasonryGridProps<T> {
  items: T[];
  columns?: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function MasonryGrid<T>({
  items,
  columns = 3,
  gap = 16,
  renderItem,
  className,
}: MasonryGridProps<T>) {
  const [columnHeights, setColumnHeights] = React.useState<number[]>(
    Array(columns).fill(0)
  );
  const [itemColumns, setItemColumns] = React.useState<number[]>([]);
  const itemRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    const heights = Array(columns).fill(0);
    const assignments: number[] = [];

    items.forEach((_, index) => {
      const ref = itemRefs.current.get(index);
      if (ref) {
        const shortestColumn = heights.indexOf(Math.min(...heights));
        assignments.push(shortestColumn);
        heights[shortestColumn] += ref.offsetHeight + gap;
      }
    });

    setColumnHeights(heights);
    setItemColumns(assignments);
  }, [items, columns, gap]);

  const columnArrays = Array.from({ length: columns }, () => [] as number[]);
  itemColumns.forEach((col, index) => {
    columnArrays[col].push(index);
  });

  return (
    <div
      className={cn('flex gap-4', className)}
      style={{ gap: `${gap}px` }}
    >
      {columnArrays.map((columnItems, colIndex) => (
        <div
          key={colIndex}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {columnItems.map((itemIndex) => (
            <div
              key={itemIndex}
              ref={(ref) => {
                if (ref) {
                  itemRefs.current.set(itemIndex, ref);
                }
              }}
            >
              {renderItem(items[itemIndex], itemIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Responsive masonry grid
export function ResponsiveMasonryGrid<T>({
  items,
  renderItem,
  className,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const [columns, setColumns] = React.useState(3);

  React.useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return (
    <MasonryGrid
      items={items}
      columns={columns}
      gap={16}
      renderItem={renderItem}
      className={className}
    />
  );
}

// NFT masonry gallery
export function NFTMasonryGallery({
  nfts,
  className,
}: {
  nfts: Array<{
    id: string;
    name: string;
    image: string;
    collection: string;
    description?: string;
  }>;
  className?: string;
}) {
  return (
    <ResponsiveMasonryGrid
      items={nfts}
      className={className}
      renderItem={(nft) => (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-auto object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold mb-1">{nft.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{nft.collection}</p>
            {nft.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {nft.description}
              </p>
            )}
          </div>
        </Card>
      )}
    />
  );
}

// Activity feed masonry
export function ActivityMasonryFeed({
  activities,
  className,
}: {
  activities: Array<{
    id: string;
    type: 'swap' | 'bridge' | 'mint' | 'transfer';
    title: string;
    description: string;
    timestamp: Date;
    chain: string;
    value?: string;
  }>;
  className?: string;
}) {
  return (
    <ResponsiveMasonryGrid
      items={activities}
      className={className}
      renderItem={(activity) => (
        <Card className="p-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <Badge
              variant={
                activity.type === 'swap'
                  ? 'default'
                  : activity.type === 'bridge'
                  ? 'secondary'
                  : activity.type === 'mint'
                  ? 'outline'
                  : 'secondary'
              }
            >
              {activity.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {activity.timestamp.toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-semibold mb-1">{activity.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {activity.description}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{activity.chain}</span>
            {activity.value && (
              <span className="font-medium">{activity.value}</span>
            )}
          </div>
        </Card>
      )}
    />
  );
}

// Airdrop eligibility masonry
export function AirdropMasonryGrid({
  airdrops,
  className,
}: {
  airdrops: Array<{
    id: string;
    name: string;
    description: string;
    status: 'active' | 'upcoming' | 'ended';
    chain: string;
    score: number;
    criteria: string[];
    logoUrl?: string;
  }>;
  className?: string;
}) {
  return (
    <ResponsiveMasonryGrid
      items={airdrops}
      className={className}
      renderItem={(airdrop) => (
        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-3 mb-3">
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
              <h3 className="font-semibold text-lg mb-1">{airdrop.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    airdrop.status === 'active'
                      ? 'default'
                      : airdrop.status === 'upcoming'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {airdrop.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {airdrop.chain}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {airdrop.description}
          </p>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Eligibility Score</span>
              <span className="text-2xl font-bold text-primary">
                {airdrop.score}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${airdrop.score}%` }}
              />
            </div>
          </div>

          {airdrop.criteria.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2">Requirements:</p>
              <ul className="space-y-1">
                {airdrop.criteria.slice(0, 3).map((criterion, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{criterion}</span>
                  </li>
                ))}
                {airdrop.criteria.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{airdrop.criteria.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </Card>
      )}
    />
  );
}

// Pinterest-style image masonry
export function ImageMasonryGrid({
  images,
  className,
}: {
  images: Array<{
    id: string;
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }>;
  className?: string;
}) {
  return (
    <ResponsiveMasonryGrid
      items={images}
      className={className}
      renderItem={(image) => (
        <div className="relative group cursor-pointer overflow-hidden rounded-lg">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />
          {(image.title || image.description) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              {image.title && (
                <h3 className="text-white font-semibold mb-1">{image.title}</h3>
              )}
              {image.description && (
                <p className="text-white/90 text-sm">{image.description}</p>
              )}
            </div>
          )}
        </div>
      )}
    />
  );
}

// Blog posts masonry
export function BlogMasonryGrid({
  posts,
  className,
}: {
  posts: Array<{
    id: string;
    title: string;
    excerpt: string;
    author: string;
    date: Date;
    category: string;
    readTime: string;
    image?: string;
  }>;
  className?: string;
}) {
  return (
    <ResponsiveMasonryGrid
      items={posts}
      className={className}
      renderItem={(post) => (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-5">
            <Badge className="mb-3">{post.category}</Badge>
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{post.author}</span>
              <div className="flex items-center gap-2">
                <span>{post.date.toLocaleDateString()}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    />
  );
}

