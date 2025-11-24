/**
 * @fileoverview Eligibility score component
 * 
 * Displays eligibility score and progress
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Progress bar component
 */
function ProgressBar({ current, max, className }: { current: number; max: number; className?: string }) {
  const percentage = Math.min(100, (current / max) * 100);

  return (
    <div className={cn('w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/**
 * Eligibility score props
 */
export interface EligibilityScoreProps {
  /** Current score */
  score?: number;
  /** Maximum score */
  maxScore?: number;
  /** Criteria met count */
  metCriteria: number;
  /** Total criteria count */
  totalCriteria: number;
  /** Custom class name */
  className?: string;
}

/**
 * Eligibility score component
 * 
 * Shows score progress and criteria summary
 */
export function EligibilityScore({
  score,
  maxScore,
  metCriteria,
  totalCriteria,
  className,
}: EligibilityScoreProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Score Display */}
      {score !== undefined && maxScore !== undefined && (
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">Eligibility Score</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {score} / {maxScore}
            </span>
          </div>
          <ProgressBar current={score} max={maxScore} />
        </div>
      )}

      {/* Criteria Summary */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Criteria:</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {metCriteria} / {totalCriteria} met
        </span>
        <ProgressBar current={metCriteria} max={totalCriteria} className="h-1.5 max-w-[100px]" />
      </div>
    </div>
  );
}

