/**
 * @fileoverview Airdrop eligibility card component
 * 
 * Displays eligibility status and criteria for an airdrop
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

/**
 * Eligibility status
 */
export enum EligibilityStatus {
  ELIGIBLE = 'eligible',
  NOT_ELIGIBLE = 'not_eligible',
  PARTIAL = 'partial',
  PENDING = 'pending',
  CLAIMED = 'claimed',
}

/**
 * Criterion status
 */
export interface Criterion {
  /** Criterion name */
  name: string;
  /** Description */
  description: string;
  /** Is met */
  met: boolean;
  /** Current value */
  currentValue?: string | number;
  /** Required value */
  requiredValue?: string | number;
  /** Weight/points */
  points?: number;
}

/**
 * Airdrop eligibility data
 */
export interface AirdropEligibility {
  /** Project name */
  projectName: string;
  /** Project logo URL */
  projectLogo?: string;
  /** Eligibility status */
  status: EligibilityStatus;
  /** Estimated allocation */
  estimatedAllocation?: number;
  /** Allocation currency symbol */
  allocationSymbol?: string;
  /** Estimated USD value */
  estimatedValueUSD?: number;
  /** Eligibility criteria */
  criteria: Criterion[];
  /** Total score */
  score?: number;
  /** Maximum possible score */
  maxScore?: number;
  /** Claim URL */
  claimUrl?: string;
  /** Deadline */
  deadline?: Date;
}

/**
 * Airdrop eligibility card props
 */
export interface AirdropEligibilityCardProps {
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
 * Airdrop eligibility card component
 */
export function AirdropEligibilityCard({
  eligibility,
  showCriteria = true,
  onClaim,
  className,
  compact = false,
}: AirdropEligibilityCardProps) {
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

            {/* Score */}
            {eligibility.score !== undefined && eligibility.maxScore !== undefined && !compact && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Eligibility Score</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {eligibility.score} / {eligibility.maxScore}
                  </span>
                </div>
                <ProgressBar current={eligibility.score} max={eligibility.maxScore} />
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

      {/* Criteria Details */}
      {showCriteria && criteriaExpanded && !compact && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Eligibility Criteria
          </h4>

          <div className="space-y-3">
            {eligibility.criteria.map((criterion, index) => (
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
      )}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <AirdropEligibilityCard
 *   eligibility={{
 *     projectName: 'Example Protocol',
 *     status: EligibilityStatus.ELIGIBLE,
 *     estimatedAllocation: 1000,
 *     allocationSymbol: 'EXAMPLE',
 *     estimatedValueUSD: 5000,
 *     score: 85,
 *     maxScore: 100,
 *     criteria: [
 *       {
 *         name: 'Wallet Age',
 *         description: 'Wallet must be at least 6 months old',
 *         met: true,
 *         currentValue: '12 months',
 *         requiredValue: '6 months',
 *         points: 20,
 *       },
 *     ],
 *     claimUrl: 'https://example.com/claim',
 *     deadline: new Date('2024-12-31'),
 *   }}
 *   onClaim={(eligibility) => console.log('Claim:', eligibility)}
 * />
 */

