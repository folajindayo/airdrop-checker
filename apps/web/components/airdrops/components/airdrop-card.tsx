'use client';

import { useState } from 'react';
import type { AirdropCheckResult } from '@airdrop-finder/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/common/status-badge';
import { CriteriaList } from './criteria-list';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AirdropCardProps {
  airdrop: AirdropCheckResult;
  className?: string;
}

export function AirdropCard({ airdrop, className }: AirdropCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const progressColor =
    airdrop.score >= 70
      ? '[&>div]:bg-green-600'
      : airdrop.score >= 40
      ? '[&>div]:bg-yellow-600'
      : '[&>div]:bg-red-600';

  return (
    <Card className={cn('transition-all hover:shadow-lg', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{airdrop.project}</CardTitle>
              <StatusBadge status={airdrop.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{airdrop.score}%</span>
              {airdrop.websiteUrl && (
                <a
                  href={airdrop.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Progress value={airdrop.score} className={cn('h-2', progressColor)} />

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {airdrop.criteria.filter((c) => c.met).length} of{' '}
            {airdrop.criteria.length} criteria met
          </span>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Eligibility Criteria</h4>
            <CriteriaList criteria={airdrop.criteria} />
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show Details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

