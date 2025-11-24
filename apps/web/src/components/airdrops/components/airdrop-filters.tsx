'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import type { AirdropStatus } from '@airdrop-finder/shared';

interface AirdropFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOption) => void;
}

export interface FilterOptions {
  status: AirdropStatus | 'all';
  minScore: number;
  chain?: string;
}

export type SortOption = 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc';

const STATUS_OPTIONS: { value: AirdropStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Airdrops' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rumored', label: 'Rumored' },
  { value: 'speculative', label: 'Speculative' },
  { value: 'expired', label: 'Expired' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'score-desc', label: 'Highest Score' },
  { value: 'score-asc', label: 'Lowest Score' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

export function AirdropFilters({ onFilterChange, onSortChange }: AirdropFiltersProps) {
  const [status, setStatus] = useState<AirdropStatus | 'all'>('all');
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<SortOption>('score-desc');

  const handleStatusChange = (newStatus: AirdropStatus | 'all') => {
    setStatus(newStatus);
    onFilterChange({ status: newStatus, minScore });
  };

  const handleMinScoreChange = (newMinScore: number) => {
    setMinScore(newMinScore);
    onFilterChange({ status, minScore: newMinScore });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    onSortChange(newSort);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filters & Sorting</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Airdrop Status</Label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as AirdropStatus | 'all')}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min Score Filter */}
          <div className="space-y-2">
            <Label htmlFor="score-filter">
              Minimum Score: {minScore}%
            </Label>
            <input
              id="score-filter"
              type="range"
              min="0"
              max="100"
              step="10"
              value={minScore}
              onChange={(e) => handleMinScoreChange(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label htmlFor="sort-select">Sort By</Label>
            <div className="relative">
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none pr-8"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {sort.includes('desc') ? (
                <SortDesc className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              ) : (
                <SortAsc className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

