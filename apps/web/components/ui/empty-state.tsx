import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Search,
  AlertCircle,
  FileQuestion,
  Wallet,
  TrendingUp,
  Calendar,
  Users,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      {icon && (
        <div className="mb-4 p-3 rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className,
}: Omit<EmptyStateProps, 'secondaryAction'>) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          action={action}
        />
      </CardContent>
    </Card>
  );
}

// Preset empty states for common scenarios
export function NoResultsFound({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="No results found"
      description="Try adjusting your search or filter criteria to find what you're looking for."
      action={onReset ? { label: 'Clear Filters', onClick: onReset } : undefined}
    />
  );
}

export function NoDataAvailable({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title="No data available"
      description="There's no data to display at the moment. Try refreshing or check back later."
      action={onRefresh ? { label: 'Refresh', onClick: onRefresh } : undefined}
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error loading this data. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-8 w-8 text-destructive" />}
      title={title}
      description={description}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
    />
  );
}

export function NotFoundState({
  resourceName = 'page',
  onGoHome,
}: {
  resourceName?: string;
  onGoHome?: () => void;
}) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-8 w-8 text-muted-foreground" />}
      title={`${resourceName} not found`}
      description={`The ${resourceName} you're looking for doesn't exist or has been removed.`}
      action={onGoHome ? { label: 'Go Home', onClick: onGoHome } : undefined}
    />
  );
}

export function NoWalletConnected({ onConnect }: { onConnect: () => void }) {
  return (
    <EmptyStateCard
      icon={<Wallet className="h-8 w-8 text-muted-foreground" />}
      title="No wallet connected"
      description="Connect your wallet to check your airdrop eligibility and see personalized results."
      action={{ label: 'Connect Wallet', onClick: onConnect }}
    />
  );
}

export function NoAirdropsEligible({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon={<TrendingUp className="h-8 w-8 text-muted-foreground" />}
      title="No eligible airdrops yet"
      description="Your wallet doesn't meet the criteria for any tracked airdrops. Start interacting with protocols to increase your eligibility!"
      action={onExplore ? { label: 'Explore Airdrops', onClick: onExplore } : undefined}
    />
  );
}

export function NoUpcomingEvents({ onViewAll }: { onViewAll?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
      title="No upcoming events"
      description="There are no scheduled snapshots or claim dates at the moment. Check back soon for updates."
      action={onViewAll ? { label: 'View All Airdrops', onClick: onViewAll } : undefined}
    />
  );
}

export function NoWatchlistWallets({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyStateCard
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No wallets in watchlist"
      description="Add wallet addresses to your watchlist to track their airdrop eligibility and scores."
      action={{ label: 'Add Wallet', onClick: onAdd }}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title="No notifications"
      description="You're all caught up! New notifications will appear here when available."
    />
  );
}

export function NoSearchHistory({ onViewAll }: { onViewAll?: () => void }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="No search history"
      description="Your recent searches will appear here for quick access."
      action={onViewAll ? { label: 'View All Airdrops', onClick: onViewAll } : undefined}
    />
  );
}

// Illustrated empty state with custom illustration
export function IllustratedEmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: {
  illustration: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="mb-6">
        {illustration}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {description}
      </p>
      {action && (
        <Button size="lg" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

