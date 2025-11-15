/**
 * @fileoverview Eligibility details component
 * 
 * Displays detailed criteria for airdrop eligibility
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Criterion } from '../types';

/**
 * Eligibility details props
 */
export interface EligibilityDetailsProps {
  /** Eligibility criteria */
  criteria: Criterion[];
  /** Custom class name */
  className?: string;
}

/**
 * Eligibility details component
 * 
 * Shows expanded view of all eligibility criteria
 */
export function EligibilityDetails({ criteria, className }: EligibilityDetailsProps) {
  return (
    <div className={cn('border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900', className)}>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
        Eligibility Criteria
      </h4>

      <div className="space-y-3">
        {criteria.map((criterion, index) => (
          <div
            key={index}
            className={cn(
              'p-4 rounded-lg',
              'bg-white dark:bg-gray-800',
              'border',
              criterion.met
                ? 'border-green-200 dark:border-green-800'
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                  criterion.met
                    ? 'bg-green-500'
                    : 'bg-gray-400 dark:bg-gray-600'
                )}
              >
                {criterion.met ? '✓' : '✗'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {criterion.name}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {criterion.description}
                    </p>
                  </div>

                  {criterion.points !== undefined && (
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      +{criterion.points} pts
                    </span>
                  )}
                </div>

                {(criterion.currentValue !== undefined || criterion.requiredValue !== undefined) && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    {criterion.currentValue !== undefined && (
                      <span className="text-gray-900 dark:text-white">
                        Current: <strong>{criterion.currentValue}</strong>
                      </span>
                    )}
                    {criterion.requiredValue !== undefined && (
                      <span className="text-gray-500 dark:text-gray-400">
                        Required: {criterion.requiredValue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

