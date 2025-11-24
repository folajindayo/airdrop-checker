/**
 * @fileoverview Eligibility card main component
 * 
 * Main container for airdrop eligibility display
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatNumber, formatCurrency } from '@/lib/utils/format';
import { EligibilityStatus, type AirdropEligibility } from '../types';
import { EligibilityScore } from './eligibility-score';
import { EligibilityDetails } from './eligibility-details';

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: EligibilityStatus }) {
  const config = {
    [EligibilityStatus.ELIGIBLE]: {
      label: 'Eligible',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      icon: '✓',
    },
    [EligibilityStatus.NOT_ELIGIBLE]: {
      label: 'Not Eligible',
      color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      icon: '✗',
    },
    [EligibilityStatus.PARTIAL]: {
      label: 'Partially Eligible',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      icon: '⚠',
    },
    [EligibilityStatus.PENDING]: {
      label: 'Pending',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      icon: '⏳',
    },
    [EligibilityStatus.CLAIMED]: {
      label: 'Claimed',
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
      icon: '✓',
    },
  };

  const { label, color, icon } = config[status];

  return (
    <span className={cn('px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1', color)}>
      <span>{icon}</span>
      {label}
    </span>
  );
}

/**
 * Eligibility card props
 */
export interface EligibilityCardProps {
  /** Eligibility data */
  eligibility: AirdropEligibility;
  /** Show detailed criteria */
  showCriteria?: boolean;
  /** On claim callback */
  onClaim?: (eligibility: AirdropEligibility) => void;
  /** Custom class name */
  className?: string;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Eligibility card component
 */
export function EligibilityCard({
  eligibility,
  showCriteria = true,
  onClaim,
  className,
  compact = false,
}: EligibilityCardProps) {
  const [criteriaExpanded, setCriteriaExpanded] = useState(false);

  const metCriteria = eligibility.criteria.filter((c) => c.met).length;
  const totalCriteria = eligibility.criteria.length;
  const isEligible = eligibility.status === EligibilityStatus.ELIGIBLE;
  const isClaimed = eligibility.status === EligibilityStatus.CLAIMED;
  const canClaim = isEligible && eligibility.claimUrl && !isClaimed;

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'hover:shadow-lg transition-shadow',
        className
      )}
    >
      {/* Header */}
      <div className={cn('p-4', compact ? 'p-3' : 'p-6')}>
        <div className="flex items-start gap-4">
          {/* Project Logo */}
          {eligibility.projectLogo && (
            <div className="flex-shrink-0">
              <img
                src={eligibility.projectLogo}
                alt={eligibility.projectName}
                className={cn('rounded-full', compact ? 'w-12 h-12' : 'w-16 h-16')}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className={cn(
                  'font-bold text-gray-900 dark:text-white',
                  compact ? 'text-lg' : 'text-xl'
                )}
              >
                {eligibility.projectName}
              </h3>

              <StatusBadge status={eligibility.status} />
            </div>

            {/* Allocation */}
            {eligibility.estimatedAllocation !== undefined && !compact && (
              <div className="mb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Estimated Allocation
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(eligibility.estimatedAllocation)}
                  </span>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    {eligibility.allocationSymbol || 'tokens'}
                  </span>
                </div>
                {eligibility.estimatedValueUSD !== undefined && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ≈ {formatCurrency(eligibility.estimatedValueUSD)}
                  </div>
                )}
              </div>
            )}

            {/* Score Component */}
            {eligibility.score !== undefined && eligibility.maxScore !== undefined && !compact && (
              <EligibilityScore
                score={eligibility.score}
                maxScore={eligibility.maxScore}
                metCriteria={metCriteria}
                totalCriteria={totalCriteria}
              />
            )}

            {/* Criteria Summary (compact mode) */}
            {!eligibility.score && (
              <EligibilityScore
                metCriteria={metCriteria}
                totalCriteria={totalCriteria}
              />
            )}

            {/* Deadline */}
            {eligibility.deadline && !compact && (
              <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                ⏰ Claim by: {eligibility.deadline.toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex gap-2 mt-4">
            {canClaim && onClaim && (
              <button
                onClick={() => onClaim(eligibility)}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium rounded-lg',
                  'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
                  'hover:from-blue-700 hover:to-purple-700',
                  'transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                Claim Airdrop
              </button>
            )}

            {showCriteria && (
              <button
                onClick={() => setCriteriaExpanded(!criteriaExpanded)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg',
                  'bg-gray-100 text-gray-900 hover:bg-gray-200',
                  'dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
                  'transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                )}
              >
                {criteriaExpanded ? 'Hide' : 'View'} Criteria
              </button>
            )}
          </div>
        )}
      </div>

      {/* Criteria Details Component */}
      {showCriteria && criteriaExpanded && !compact && (
        <EligibilityDetails criteria={eligibility.criteria} />
      )}
    </div>
  );
}

