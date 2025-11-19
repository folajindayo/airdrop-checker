"use client";

import React from "react";
import { StatCard } from "../ui/Card";

interface WalletInfoProps {
  address: string;
  balance?: string;
  eligibleAirdrops?: number;
  claimedAirdrops?: number;
  totalValue?: string;
}

/**
 * WalletInfo Component
 * Displays wallet statistics and information
 */
export default function WalletInfo({
  address,
  balance,
  eligibleAirdrops = 0,
  claimedAirdrops = 0,
  totalValue,
}: WalletInfoProps) {
  return (
    <div className="space-y-6">
      {/* Wallet Address */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-medium text-gray-600">Wallet Address</h3>
        <p className="mt-2 font-mono text-lg font-semibold text-gray-900">
          {address}
        </p>
        {balance && (
          <p className="mt-2 text-sm text-gray-600">
            Balance: <span className="font-medium">{balance} ETH</span>
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Eligible Airdrops"
          value={eligibleAirdrops}
          icon="🎯"
        />
        <StatCard
          label="Claimed Airdrops"
          value={claimedAirdrops}
          icon="✅"
        />
        {totalValue && (
          <StatCard
            label="Total Value"
            value={totalValue}
            icon="💰"
          />
        )}
      </div>
    </div>
  );
}

