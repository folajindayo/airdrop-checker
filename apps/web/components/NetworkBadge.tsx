/**
 * NetworkBadge Component
 */

'use client';

interface NetworkBadgeProps {
  chainId: number;
  showIcon?: boolean;
}

const NETWORK_INFO: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: 'Ethereum', icon: '⟠', color: 'bg-blue-100 text-blue-700' },
  137: { name: 'Polygon', icon: '◆', color: 'bg-purple-100 text-purple-700' },
  8453: { name: 'Base', icon: '🔵', color: 'bg-blue-100 text-blue-700' },
  42161: { name: 'Arbitrum', icon: '🔷', color: 'bg-blue-100 text-blue-700' },
};

export function NetworkBadge({ chainId, showIcon = true }: NetworkBadgeProps) {
  const network = NETWORK_INFO[chainId] || {
    name: `Chain ${chainId}`,
    icon: '🔗',
    color: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${network.color}`}>
      {showIcon && <span>{network.icon}</span>}
      {network.name}
    </span>
  );
}

