"use client";

import React from "react";
import AirdropCard from "./AirdropCard";

interface Airdrop {
  id: string;
  name: string;
  logo?: string;
  status: "active" | "upcoming" | "ended";
  eligibility?: boolean;
  amount?: string;
  claimBy?: string;
  description?: string;
}

interface AirdropGridProps {
  airdrops: Airdrop[];
  loading?: boolean;
  onClaim?: (id: string) => void;
  onCheckEligibility?: (id: string) => void;
}

/**
 * AirdropGrid Component
 * Responsive grid layout for airdrop cards
 */
export default function AirdropGrid({
  airdrops,
  loading = false,
  onClaim,
  onCheckEligibility,
}: AirdropGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (airdrops.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-lg text-gray-600">No airdrops found</p>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {airdrops.map((airdrop) => (
        <AirdropCard
          key={airdrop.id}
          {...airdrop}
          onClaim={onClaim ? () => onClaim(airdrop.id) : undefined}
          onCheckEligibility={
            onCheckEligibility
              ? () => onCheckEligibility(airdrop.id)
              : undefined
          }
        />
      ))}
    </div>
  );
}

