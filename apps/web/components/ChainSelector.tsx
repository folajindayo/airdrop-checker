/**
 * ChainSelector Component
 */

'use client';

import { useState } from 'react';

interface Chain {
  id: number;
  name: string;
  logo: string;
}

const SUPPORTED_CHAINS: Chain[] = [
  { id: 1, name: 'Ethereum', logo: '⟠' },
  { id: 137, name: 'Polygon', logo: '◆' },
  { id: 8453, name: 'Base', logo: '🔵' },
  { id: 42161, name: 'Arbitrum', logo: '🔷' },
];

interface ChainSelectorProps {
  value: number;
  onChange: (chainId: number) => void;
}

export function ChainSelector({ value, onChange }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = SUPPORTED_CHAINS.find((c) => c.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
      >
        <span>{selected?.logo}</span>
        <span>{selected?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg">
          {SUPPORTED_CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                onChange(chain.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
            >
              <span>{chain.logo}</span>
              <span>{chain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

