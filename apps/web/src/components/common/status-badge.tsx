import * as React from 'react';
import { cn } from '@/lib/utils';

export function StatusBadge({
    status,
    children,
    className,
}: {
    status: 'online' | 'offline' | 'away' | 'busy' | string;
    children?: React.ReactNode;
    className?: string;
}) {
    const statusConfig: Record<string, { color: string; label: string }> = {
        online: { color: 'bg-green-500', label: 'Online' },
        offline: { color: 'bg-gray-500', label: 'Offline' },
        away: { color: 'bg-yellow-500', label: 'Away' },
        busy: { color: 'bg-red-500', label: 'Busy' },
        // Add default or dynamic handling if needed
        active: { color: 'bg-green-500', label: 'Active' },
        inactive: { color: 'bg-gray-500', label: 'Inactive' },
        pending: { color: 'bg-yellow-500', label: 'Pending' },
        upcoming: { color: 'bg-blue-500', label: 'Upcoming' },
        ended: { color: 'bg-gray-500', label: 'Ended' },
        live: { color: 'bg-green-500', label: 'Live' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-500', label: status };

    return (
        <div className={cn('relative inline-block', className)}>
            {children}
            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary', className)}>
                <span className={cn('block h-2 w-2 rounded-full', config.color)} />
                {config.label}
            </span>
        </div>
    );
}
