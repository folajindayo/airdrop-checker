'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AirdropCheckResult } from '@airdrop-finder/shared';
import { cn } from '@/lib/utils';

interface AirdropSearchProps {
  airdrops: AirdropCheckResult[];
  onSelect?: (airdrop: AirdropCheckResult) => void;
  className?: string;
}

export function AirdropSearch({ airdrops, onSelect, className }: AirdropSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredAirdrops = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    return airdrops.filter((airdrop) => {
      // Search by project name
      if (airdrop.project.toLowerCase().includes(query)) {
        return true;
      }

      // Search by status
      if (airdrop.status.toLowerCase().includes(query)) {
        return true;
      }

      // Search by criteria descriptions
      const hasCriteriaMatch = airdrop.criteria.some((c) =>
        c.description.toLowerCase().includes(query)
      );

      return hasCriteriaMatch;
    });
  }, [airdrops, searchQuery]);

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleSelect = (airdrop: AirdropCheckResult) => {
    onSelect?.(airdrop);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search airdrops by name, status, or criteria..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchQuery && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Results */}
          <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto shadow-lg">
            <CardContent className="p-2">
              {filteredAirdrops.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No airdrops found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    {filteredAirdrops.length} result{filteredAirdrops.length !== 1 ? 's' : ''}
                  </div>
                  {filteredAirdrops.map((airdrop) => (
                    <button
                      key={airdrop.projectId}
                      onClick={() => handleSelect(airdrop)}
                      className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{airdrop.project}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              airdrop.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : airdrop.status === 'rumored'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {airdrop.status}
                          </span>
                          <span className="font-bold text-sm">{airdrop.score}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {airdrop.criteria.filter((c) => c.met).length}/
                        {airdrop.criteria.length} criteria met
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick Stats */}
      {airdrops.length > 0 && !searchQuery && (
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{airdrops.length} airdrops tracked</span>
          </div>
          <div>
            {airdrops.filter((a) => a.score >= 70).length} high scores (≥70%)
          </div>
          <div>
            {airdrops.filter((a) => a.status === 'confirmed').length} confirmed
          </div>
        </div>
      )}
    </div>
  );
}

