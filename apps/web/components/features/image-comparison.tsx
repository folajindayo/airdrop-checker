'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  defaultPosition?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ImageComparison({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  defaultPosition = 50,
  orientation = 'horizontal',
  className,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = React.useState(defaultPosition);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    if (orientation === 'horizontal') {
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    } else {
      const y = e.clientY - rect.top;
      const percentage = (y / rect.height) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();

    if (orientation === 'horizontal') {
      const x = touch.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    } else {
      const y = touch.clientY - rect.top;
      const percentage = (y / rect.height) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const clipStyle =
    orientation === 'horizontal'
      ? { clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }
      : { clipPath: `inset(0 0 ${100 - sliderPosition}% 0)` };

  const sliderStyle =
    orientation === 'horizontal'
      ? { left: `${sliderPosition}%` }
      : { top: `${sliderPosition}%` };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden select-none', className)}
      style={{ touchAction: 'none' }}
    >
      {/* Before image */}
      <img
        src={beforeImage}
        alt={beforeLabel}
        className="w-full h-full object-cover"
        draggable={false}
      />

      {/* After image */}
      <div className="absolute inset-0" style={clipStyle}>
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
        {afterLabel}
      </div>

      {/* Slider */}
      <div
        className={cn(
          'absolute z-10 flex items-center justify-center cursor-ew-resize',
          orientation === 'horizontal'
            ? 'top-0 bottom-0 w-1 bg-white shadow-lg -ml-0.5'
            : 'left-0 right-0 h-1 bg-white shadow-lg -mt-0.5 cursor-ns-resize'
        )}
        style={sliderStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div
          className={cn(
            'bg-white rounded-full shadow-xl flex items-center justify-center',
            orientation === 'horizontal' ? 'w-10 h-10' : 'w-10 h-10'
          )}
        >
          <GripVertical
            className={cn(
              'h-6 w-6 text-gray-700',
              orientation === 'vertical' && 'rotate-90'
            )}
          />
        </div>
      </div>
    </div>
  );
}

// Before/After comparison card
export function BeforeAfterCard({
  beforeImage,
  afterImage,
  title,
  description,
  className,
}: {
  beforeImage: string;
  afterImage: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="aspect-video">
        <ImageComparison
          beforeImage={beforeImage}
          afterImage={afterImage}
          beforeLabel="Before"
          afterLabel="After"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </Card>
  );
}

// Wallet balance comparison
export function WalletBalanceComparison({
  beforeBalance,
  afterBalance,
  beforeDate,
  afterDate,
  className,
}: {
  beforeBalance: string;
  afterBalance: string;
  beforeDate: Date;
  afterDate: Date;
  className?: string;
}) {
  return (
    <Card className={cn('p-6', className)}>
      <h3 className="font-semibold mb-4">Balance Comparison</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">
            {beforeDate.toLocaleDateString()}
          </p>
          <p className="text-2xl font-bold">{beforeBalance}</p>
          <p className="text-xs text-muted-foreground mt-1">Previous</p>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">
            {afterDate.toLocaleDateString()}
          </p>
          <p className="text-2xl font-bold text-primary">{afterBalance}</p>
          <p className="text-xs text-muted-foreground mt-1">Current</p>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{
            width: `${
              (parseFloat(afterBalance) / parseFloat(beforeBalance)) * 100
            }%`,
          }}
        />
      </div>
    </Card>
  );
}

// Score comparison
export function ScoreComparison({
  beforeScore,
  afterScore,
  beforeDate,
  afterDate,
  metric = 'Airdrop Score',
  className,
}: {
  beforeScore: number;
  afterScore: number;
  beforeDate: Date;
  afterDate: Date;
  metric?: string;
  className?: string;
}) {
  const change = afterScore - beforeScore;
  const changePercentage = ((change / beforeScore) * 100).toFixed(1);

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="font-semibold mb-4">{metric} Comparison</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Before</p>
          <p className="text-xs text-muted-foreground mb-2">
            {beforeDate.toLocaleDateString()}
          </p>
          <p className="text-4xl font-bold">{beforeScore}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">After</p>
          <p className="text-xs text-muted-foreground mb-2">
            {afterDate.toLocaleDateString()}
          </p>
          <p className="text-4xl font-bold text-primary">{afterScore}</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Change</span>
        <div className="text-right">
          <span
            className={cn(
              'text-lg font-bold',
              change > 0 ? 'text-green-500' : 'text-red-500'
            )}
          >
            {change > 0 ? '+' : ''}
            {change}
          </span>
          <span
            className={cn(
              'text-xs ml-2',
              change > 0 ? 'text-green-500' : 'text-red-500'
            )}
          >
            ({change > 0 ? '+' : ''}
            {changePercentage}%)
          </span>
        </div>
      </div>
    </Card>
  );
}

// Portfolio comparison
export function PortfolioComparison({
  beforeData,
  afterData,
  className,
}: {
  beforeData: {
    totalValue: string;
    tokens: number;
    nfts: number;
    protocols: number;
  };
  afterData: {
    totalValue: string;
    tokens: number;
    nfts: number;
    protocols: number;
  };
  className?: string;
}) {
  const metrics = [
    { label: 'Total Value', before: beforeData.totalValue, after: afterData.totalValue },
    { label: 'Tokens', before: beforeData.tokens.toString(), after: afterData.tokens.toString() },
    { label: 'NFTs', before: beforeData.nfts.toString(), after: afterData.nfts.toString() },
    { label: 'Protocols', before: beforeData.protocols.toString(), after: afterData.protocols.toString() },
  ];

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="font-semibold mb-4">Portfolio Comparison</h3>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{metric.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{metric.before}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold text-primary">{metric.after}</span>
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${
                    (parseFloat(metric.after) / parseFloat(metric.before)) * 50
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Chart comparison
export function ChartComparison({
  beforeChart,
  afterChart,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}: {
  beforeChart: React.ReactNode;
  afterChart: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">{beforeLabel}</h4>
          {beforeChart}
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-primary">{afterLabel}</h4>
          {afterChart}
        </div>
      </div>
    </Card>
  );
}

