'use client';

import * as React from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  variant?: 'default' | 'pills' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
  suggestions?: string[];
  onTagClick?: (tag: string) => void;
  validateTag?: (tag: string) => boolean;
}

export function TagsInput({
  value,
  onChange,
  placeholder = 'Add a tag...',
  maxTags,
  allowDuplicates = false,
  variant = 'default',
  size = 'default',
  disabled = false,
  className,
  suggestions = [],
  onTagClick,
  validateTag,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue || !suggestions.length) return [];
    return suggestions.filter(
      (s) =>
        s.toLowerCase().includes(inputValue.toLowerCase()) &&
        (allowDuplicates || !value.includes(s))
    );
  }, [inputValue, suggestions, value, allowDuplicates]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Check if max tags reached
    if (maxTags && value.length >= maxTags) return;

    // Check for duplicates
    if (!allowDuplicates && value.includes(trimmedTag)) return;

    // Validate tag
    if (validateTag && !validateTag(trimmedTag)) return;

    onChange([...value, trimmedTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getTagVariant = (): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (variant) {
      case 'pills':
        return 'secondary';
      case 'outline':
        return 'outline';
      case 'secondary':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const sizeClasses = {
    sm: 'text-xs h-5 px-2',
    default: 'text-sm h-6 px-2',
    lg: 'text-base h-7 px-3',
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'flex min-h-[40px] w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`}
            variant={getTagVariant()}
            className={cn(
              'flex items-center gap-1',
              sizeClasses[size],
              onTagClick && 'cursor-pointer hover:bg-primary/80',
              variant === 'pills' && 'rounded-full'
            )}
            onClick={() => onTagClick?.(tag)}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              disabled={disabled}
              className="ml-1 rounded-full hover:bg-background/50"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled || (maxTags ? value.length >= maxTags : false)}
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Max tags indicator */}
      {maxTags && (
        <div className="mt-1 text-xs text-muted-foreground">
          {value.length} / {maxTags} tags
        </div>
      )}
    </div>
  );
}

// Wallet address tags input
export function WalletTagsInput({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (addresses: string[]) => void;
  className?: string;
}) {
  const validateWalletAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  return (
    <TagsInput
      value={value}
      onChange={onChange}
      placeholder="Add wallet address (0x...)"
      maxTags={10}
      allowDuplicates={false}
      validateTag={validateWalletAddress}
      className={className}
    />
  );
}

// Chain tags selector
export function ChainTagsInput({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (chains: string[]) => void;
  className?: string;
}) {
  const chainSuggestions = [
    'Ethereum',
    'Base',
    'Arbitrum',
    'Optimism',
    'Polygon',
    'zkSync',
    'Avalanche',
    'BSC',
    'Fantom',
    'Celo',
  ];

  return (
    <TagsInput
      value={value}
      onChange={onChange}
      placeholder="Select chains..."
      suggestions={chainSuggestions}
      variant="pills"
      className={className}
    />
  );
}

// Protocol tags input
export function ProtocolTagsInput({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (protocols: string[]) => void;
  className?: string;
}) {
  const protocolSuggestions = [
    'Uniswap',
    'Aave',
    'Compound',
    'Curve',
    'Lido',
    'MakerDAO',
    'Sushiswap',
    'Balancer',
    'Yearn',
    '1inch',
    'Hop Protocol',
    'Across',
    'Stargate',
    'LayerZero',
    'Arbitrum Bridge',
    'Optimism Bridge',
  ];

  return (
    <TagsInput
      value={value}
      onChange={onChange}
      placeholder="Add protocols..."
      suggestions={protocolSuggestions}
      variant="secondary"
      className={className}
    />
  );
}

// Tags input with add button
export function TagsInputWithButton({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}) {
  const [inputValue, setInputValue] = React.useState('');

  const addTag = () => {
    const trimmedTag = inputValue.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a tag..."
          className="flex-1"
        />
        <Button type="button" onClick={addTag} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="rounded-full hover:bg-background/50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Colored tags input
export function ColoredTagsInput({
  value,
  onChange,
  className,
}: {
  value: Array<{ label: string; color: string }>;
  onChange: (tags: Array<{ label: string; color: string }>) => void;
  className?: string;
}) {
  const [inputValue, setInputValue] = React.useState('');
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  const addTag = () => {
    const trimmedTag = inputValue.trim();
    if (trimmedTag) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      onChange([...value, { label: trimmedTag, color: randomColor }]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a colored tag..."
          className="flex-1"
        />
        <Button type="button" onClick={addTag} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge
              key={`${tag.label}-${index}`}
              className={cn(
                'gap-1 text-white border-0',
                tag.color
              )}
            >
              <span>{tag.label}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="rounded-full hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

