'use client';

import * as React from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface SearchFilter {
  id: string;
  label: string;
  value: any;
  type: 'text' | 'checkbox' | 'range' | 'select';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
}

export interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  filters?: SearchFilter[];
  placeholder?: string;
  className?: string;
}

export function AdvancedSearch({
  onSearch,
  filters = [],
  placeholder = 'Search...',
  className,
}: AdvancedSearchProps) {
  const [query, setQuery] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<SearchFilter[]>(filters);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const handleSearch = () => {
    onSearch(query, activeFilters);
  };

  const handleFilterChange = (id: string, value: any) => {
    setActiveFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, value } : filter
      )
    );
  };

  const clearFilters = () => {
    setActiveFilters(filters);
    setQuery('');
    onSearch('', filters);
  };

  const activeFilterCount = activeFilters.filter(
    (f) => f.value !== undefined && f.value !== '' && f.value !== false
  ).length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                handleSearch();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Refine your search with advanced filters
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {activeFilters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label>{filter.label}</Label>
                  {filter.type === 'checkbox' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filter.value}
                        onCheckedChange={(checked) =>
                          handleFilterChange(filter.id, checked)
                        }
                      />
                      <span className="text-sm">{filter.label}</span>
                    </div>
                  )}
                  {filter.type === 'range' && (
                    <div className="space-y-2">
                      <Slider
                        value={[filter.value || filter.min || 0]}
                        onValueChange={([value]) =>
                          handleFilterChange(filter.id, value)
                        }
                        min={filter.min || 0}
                        max={filter.max || 100}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{filter.min || 0}</span>
                        <span>{filter.value || filter.min || 0}</span>
                        <span>{filter.max || 100}</span>
                      </div>
                    </div>
                  )}
                  {filter.type === 'text' && (
                    <Input
                      value={filter.value || ''}
                      onChange={(e) =>
                        handleFilterChange(filter.id, e.target.value)
                      }
                      placeholder={`Enter ${filter.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
              <Separator />
              <div className="flex gap-2">
                <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  Clear
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters
            .filter((f) => f.value !== undefined && f.value !== '' && f.value !== false)
            .map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="gap-1"
              >
                {filter.label}: {String(filter.value)}
                <button
                  onClick={() => handleFilterChange(filter.id, undefined)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

// Simple search bar
export function SimpleSearch({
  onSearch,
  placeholder = 'Search...',
  className,
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = React.useState('');

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Search with suggestions
export function SearchWithSuggestions({
  onSearch,
  suggestions = [],
  placeholder = 'Search...',
  className,
}: {
  onSearch: (query: string) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch(query);
              setShowSuggestions(false);
            }
          }}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onSearch('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion);
                setShowSuggestions(false);
              }}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

