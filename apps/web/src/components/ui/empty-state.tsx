/**
 * EmptyState Component
 */

'use client';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-3xl">📭</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title, description, onRetry }: { title: string; description: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-red-600">
      <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm mb-4">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Retry
        </button>
      )}
    </div>
  );
}

export function NoUpcomingEvents() {
  return (
    <EmptyState
      title="No Upcoming Events"
      description="There are no airdrop events scheduled for the near future."
    />
  );
}
