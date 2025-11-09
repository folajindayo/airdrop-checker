'use client';

import * as React from 'react';
import { Star, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  value,
  max = 5,
  size = 'md',
  readonly = false,
  onChange,
  showValue = false,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, i) => {
        const rating = i + 1;
        const isFilled = rating <= (hoverValue ?? value);

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => !readonly && setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(null)}
            disabled={readonly}
            className={cn(
              'transition-colors',
              !readonly && 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-muted-foreground'
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium">
          {value.toFixed(1)} / {max}
        </span>
      )}
    </div>
  );
}

// Heart rating
export function HeartRating({
  value,
  max = 5,
  size = 'md',
  readonly = false,
  onChange,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, i) => {
        const rating = i + 1;
        const isFilled = rating <= (hoverValue ?? value);

        return (
          <button
            key={i}
            type="button"
            onClick={() => !readonly && onChange?.(rating)}
            onMouseEnter={() => !readonly && setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(null)}
            disabled={readonly}
            className={cn('transition-colors', !readonly && 'cursor-pointer')}
          >
            <Heart
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-red-500 text-red-500'
                  : 'fill-none text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// Thumbs up/down rating
export function ThumbsRating({
  value,
  upCount,
  downCount,
  readonly = false,
  onChange,
  className,
}: {
  value?: 'up' | 'down' | null;
  upCount?: number;
  downCount?: number;
  readonly?: boolean;
  onChange?: (value: 'up' | 'down') => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant={value === 'up' ? 'default' : 'outline'}
        size="sm"
        onClick={() => !readonly && onChange?.('up')}
        disabled={readonly}
        className="gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
        {upCount !== undefined && <span>{upCount}</span>}
      </Button>
      <Button
        variant={value === 'down' ? 'destructive' : 'outline'}
        size="sm"
        onClick={() => !readonly && onChange?.('down')}
        disabled={readonly}
        className="gap-1"
      >
        <ThumbsDown className="h-4 w-4" />
        {downCount !== undefined && <span>{downCount}</span>}
      </Button>
    </div>
  );
}

// Review card
export interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  content: string;
  date: Date;
  helpful?: number;
  verified?: boolean;
}

export function ReviewCard({ review, className }: { review: Review; className?: string }) {
  const [helpfulCount, setHelpfulCount] = React.useState(review.helpful || 0);
  const [hasVoted, setHasVoted] = React.useState(false);

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {review.author.avatar ? (
                <img src={review.author.avatar} alt={review.author.name} />
              ) : (
                <div className="bg-primary text-primary-foreground flex items-center justify-center">
                  {review.author.name[0]}
                </div>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{review.author.name}</p>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {review.date.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <StarRating value={review.rating} readonly size="sm" />
        </div>

        {review.title && <h4 className="font-semibold">{review.title}</h4>}
        <p className="text-sm text-muted-foreground">{review.content}</p>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!hasVoted) {
                setHelpfulCount(helpfulCount + 1);
                setHasVoted(true);
              }
            }}
            disabled={hasVoted}
            className="gap-1"
          >
            <ThumbsUp className="h-3 w-3" />
            Helpful ({helpfulCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Rating summary
export function RatingSummary({
  averageRating,
  totalReviews,
  distribution,
  className,
}: {
  averageRating: number;
  totalReviews: number;
  distribution: { stars: number; count: number; percentage: number }[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
            <StarRating value={averageRating} readonly className="mt-2 justify-center" />
            <p className="text-sm text-muted-foreground mt-1">
              {totalReviews.toLocaleString()} reviews
            </p>
          </div>

          <div className="flex-1 space-y-2">
            {distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="text-sm w-8">{item.stars}★</span>
                <Progress value={item.percentage} className="flex-1" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Write review form
export function WriteReview({
  onSubmit,
  className,
}: {
  onSubmit: (review: { rating: number; title: string; content: string }) => void;
  className?: string;
}) {
  const [rating, setRating] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');

  const handleSubmit = () => {
    if (rating > 0 && content) {
      onSubmit({ rating, title, content });
      setRating(0);
      setTitle('');
      setContent('');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>Share your experience with others</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rating</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Review</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={5}
          />
        </div>

        <Button onClick={handleSubmit} disabled={rating === 0 || !content} className="w-full">
          Submit Review
        </Button>
      </CardContent>
    </Card>
  );
}

// Airdrop rating widget
export function AirdropRating({
  projectName,
  rating,
  totalRatings,
  onRate,
  userRating,
  className,
}: {
  projectName: string;
  rating: number;
  totalRatings: number;
  onRate?: (rating: number) => void;
  userRating?: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{projectName}</h4>
            <Badge>{rating.toFixed(1)}</Badge>
          </div>
          <StarRating
            value={userRating || rating}
            onChange={onRate}
            readonly={!onRate}
            showValue
          />
          <p className="text-xs text-muted-foreground">
            Based on {totalRatings.toLocaleString()} ratings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

