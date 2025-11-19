"use client";

import React, { useState } from "react";

interface Network {
  id: number;
  name: string;
  icon?: string;
  chainId: string;
}

interface NetworkSelectorProps {
  networks: Network[];
  selectedNetwork: number;
  onNetworkChange: (networkId: number) => void;
}

/**
 * NetworkSelector Component
 * Allows users to switch between blockchain networks
 */
export default function NetworkSelector({
  networks,
  selectedNetwork,
  onNetworkChange,
}: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentNetwork = networks.find((n) => n.id === selectedNetwork);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {currentNetwork?.icon && (
          <span className="text-lg">{currentNetwork.icon}</span>
        )}
        <span>{currentNetwork?.name || "Select Network"}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  onNetworkChange(network.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                  network.id === selectedNetwork
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-900"
                }`}
              >
                {network.icon && (
                  <span className="text-lg">{network.icon}</span>
                )}
                <span className="font-medium">{network.name}</span>
                {network.id === selectedNetwork && (
                  <svg
                    className="ml-auto h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

