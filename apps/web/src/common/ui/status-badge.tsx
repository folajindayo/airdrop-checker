import type { AirdropStatus } from '@airdrop-finder/shared';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AirdropStatus;
  className?: string;
}

const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  rumored: {
    label: 'Rumored',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  speculative: {
    label: 'Speculative',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

