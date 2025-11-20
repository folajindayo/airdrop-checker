/**
 * Airdrop Card Component
 * Display airdrop information in a card format
 */

'use client';

import { AirdropEntity, AirdropStatus } from '../../../domain/entities';

export interface AirdropCardProps {
  airdrop: AirdropEntity;
  eligibilityScore?: number;
  onClick?: () => void;
}

export function AirdropCard({ airdrop, eligibilityScore, onClick }: AirdropCardProps) {
  const getStatusColor = (status: AirdropStatus): string => {
    switch (status) {
      case AirdropStatus.ACTIVE:
        return 'bg-green-500';
      case AirdropStatus.UPCOMING:
        return 'bg-blue-500';
      case AirdropStatus.ENDED:
        return 'bg-gray-500';
      case AirdropStatus.CLAIMED:
        return 'bg-purple-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div
      className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {airdrop.metadata.logoUrl && (
            <img
              src={airdrop.metadata.logoUrl}
              alt={airdrop.name}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold">{airdrop.name}</h3>
            <p className="text-sm text-gray-500">{airdrop.protocol}</p>
          </div>
        </div>
        
        <span
          className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(
            airdrop.status
          )}`}
        >
          {airdrop.status}
        </span>
      </div>

      {airdrop.metadata.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {airdrop.metadata.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span>Start: {formatDate(airdrop.startDate)}</span>
        {airdrop.endDate && <span>End: {formatDate(airdrop.endDate)}</span>}
      </div>

      {eligibilityScore !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Eligibility Score</span>
            <span className="font-semibold">{eligibilityScore.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${eligibilityScore}%` }}
            />
          </div>
        </div>
      )}

      {airdrop.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {airdrop.metadata.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

