/**
 * AirdropsList Component
 */

'use client';

import { useAirdrop } from '../lib/hooks/useAirdrop';
import { AirdropCard } from './AirdropCard';
import { Spinner } from './ui/Spinner';

interface AirdropsListProps {
  address: string;
}

export function AirdropsList({ address }: AirdropsListProps) {
  const { airdrops, loading, error } = useAirdrop(address);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const eligibleAirdrops = airdrops.filter((a) => a.eligibility);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Airdrops</h2>
        <span className="text-sm text-gray-500">
          {eligibleAirdrops.length} eligible
        </span>
      </div>

      {airdrops.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No airdrops found for this address
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {airdrops.map((airdrop) => (
            <AirdropCard key={airdrop.id} airdrop={airdrop} />
          ))}
        </div>
      )}
    </div>
  );
}

