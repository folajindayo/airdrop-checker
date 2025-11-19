"use client";

import React, { useState } from "react";
import Button from "../ui/Button";

interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  address?: string;
}

/**
 * WalletConnect Component
 * Handles wallet connection UI and logic
 */
export default function WalletConnect({
  onConnect,
  onDisconnect,
  address,
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask to connect your wallet");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        onConnect(accounts[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-mono text-sm text-gray-900">
              {truncateAddress(address)}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="primary"
        size="md"
        onClick={handleConnect}
        loading={isConnecting}
      >
        Connect Wallet
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

