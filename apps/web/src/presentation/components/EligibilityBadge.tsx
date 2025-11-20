/**
 * Eligibility Badge Component
 * Display eligibility status with visual indicator
 */

'use client';

export interface EligibilityBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EligibilityBadge({
  score,
  label = 'Eligibility',
  size = 'md',
}: EligibilityBadgeProps) {
  const getColor = (): string => {
    if (score >= 75) return 'green';
    if (score >= 50) return 'yellow';
    if (score >= 25) return 'orange';
    return 'red';
  };

  const getStatus = (): string => {
    if (score >= 75) return 'High';
    if (score >= 50) return 'Medium';
    if (score >= 25) return 'Low';
    return 'Very Low';
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const color = getColor();
  const status = getStatus();

  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    red: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border font-medium ${getSizeClasses()} ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          color === 'green'
            ? 'bg-green-500'
            : color === 'yellow'
            ? 'bg-yellow-500'
            : color === 'orange'
            ? 'bg-orange-500'
            : 'bg-red-500'
        }`}
      />
      <span>
        {label}: {status} ({score.toFixed(0)}%)
      </span>
    </div>
  );
}

