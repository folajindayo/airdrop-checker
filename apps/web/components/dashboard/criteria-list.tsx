import type { CriteriaResult } from '@airdrop-finder/shared';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CriteriaListProps {
  criteria: CriteriaResult[];
  className?: string;
}

export function CriteriaList({ criteria, className }: CriteriaListProps) {
  return (
    <ul className={cn('space-y-2', className)}>
      {criteria.map((criterion, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <span
            className={cn(
              'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0',
              criterion.met
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            )}
          >
            {criterion.met ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </span>
          <span
            className={cn(
              criterion.met
                ? 'text-foreground'
                : 'text-muted-foreground line-through'
            )}
          >
            {criterion.desc}
          </span>
        </li>
      ))}
    </ul>
  );
}

