'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface Chain {
  id: string | number;
  name: string;
  icon?: string;
  color?: string;
  testnet?: boolean;
}

const SUPPORTED_CHAINS: Chain[] = [
  { id: 1, name: 'Ethereum', icon: '⟠', color: 'bg-blue-500' },
  { id: 8453, name: 'Base', icon: '🔵', color: 'bg-blue-600' },
  { id: 42161, name: 'Arbitrum', icon: '🔷', color: 'bg-blue-400' },
  { id: 10, name: 'Optimism', icon: '🔴', color: 'bg-red-500' },
  { id: 324, name: 'zkSync Era', icon: '⚡', color: 'bg-purple-500' },
  { id: 137, name: 'Polygon', icon: '💜', color: 'bg-purple-600' },
];

interface ChainSelectorProps {
  selectedChains: (string | number)[];
  onSelectionChange: (chains: (string | number)[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function ChainSelector({
  selectedChains,
  onSelectionChange,
  multiSelect = true,
  className,
}: ChainSelectorProps) {
  const handleChainToggle = (chainId: string | number) => {
    if (multiSelect) {
      if (selectedChains.includes(chainId)) {
        onSelectionChange(selectedChains.filter((id) => id !== chainId));
      } else {
        onSelectionChange([...selectedChains, chainId]);
      }
    } else {
      onSelectionChange([chainId]);
    }
  };

  const selectedCount = selectedChains.length;
  const allSelected = selectedCount === SUPPORTED_CHAINS.length;

  const buttonText = allSelected
    ? 'All Chains'
    : selectedCount === 0
    ? 'Select Chains'
    : selectedCount === 1
    ? SUPPORTED_CHAINS.find((c) => c.id === selectedChains[0])?.name || 'Chain'
    : `${selectedCount} Chains`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('w-full justify-between', className)}>
          <span>{buttonText}</span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select Chains</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_CHAINS.map((chain) => {
          const isSelected = selectedChains.includes(chain.id);
          return (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => handleChainToggle(chain.id)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {chain.icon && <span>{chain.icon}</span>}
                  <span>{chain.name}</span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          );
        })}
        {multiSelect && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                onSelectionChange(
                  allSelected ? [] : SUPPORTED_CHAINS.map((c) => c.id)
                )
              }
            >
              <div className="flex items-center justify-between w-full">
                <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Grid selector for larger displays
export function ChainGridSelector({
  selectedChains,
  onSelectionChange,
  multiSelect = true,
  className,
}: ChainSelectorProps) {
  const handleChainToggle = (chainId: string | number) => {
    if (multiSelect) {
      if (selectedChains.includes(chainId)) {
        onSelectionChange(selectedChains.filter((id) => id !== chainId));
      } else {
        onSelectionChange([...selectedChains, chainId]);
      }
    } else {
      onSelectionChange([chainId]);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Select Chains</label>
        {multiSelect && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onSelectionChange(
                selectedChains.length === SUPPORTED_CHAINS.length
                  ? []
                  : SUPPORTED_CHAINS.map((c) => c.id)
              )
            }
          >
            {selectedChains.length === SUPPORTED_CHAINS.length
              ? 'Deselect All'
              : 'Select All'}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {SUPPORTED_CHAINS.map((chain) => {
          const isSelected = selectedChains.includes(chain.id);
          return (
            <button
              key={chain.id}
              onClick={() => handleChainToggle(chain.id)}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent'
              )}
            >
              <span className="text-xl">{chain.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{chain.name}</p>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Chain badge component
export function ChainBadge({
  chainId,
  className,
}: {
  chainId: string | number;
  className?: string;
}) {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);

  if (!chain) return null;

  return (
    <Badge
      variant="secondary"
      className={cn('flex items-center gap-1', className)}
    >
      {chain.icon && <span>{chain.icon}</span>}
      {chain.name}
    </Badge>
  );
}

// Chain list component
export function ChainList({
  chainIds,
  className,
}: {
  chainIds: (string | number)[];
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chainIds.map((id) => (
        <ChainBadge key={id} chainId={id} />
      ))}
    </div>
  );
}

// Single chain display
export function ChainDisplay({
  chainId,
  showIcon = true,
  className,
}: {
  chainId: string | number;
  showIcon?: boolean;
  className?: string;
}) {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);

  if (!chain) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && chain.icon && <span>{chain.icon}</span>}
      <span className="text-sm font-medium">{chain.name}</span>
    </div>
  );
}

// Export for use in other components
export { SUPPORTED_CHAINS };

