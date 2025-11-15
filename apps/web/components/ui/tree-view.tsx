'use client';

import * as React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  Circle,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  metadata?: Record<string, any>;
}

export interface TreeViewProps {
  data: TreeNode[];
  onNodeClick?: (node: TreeNode) => void;
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void;
  defaultExpandedIds?: string[];
  variant?: 'default' | 'files' | 'minimal';
  selectable?: boolean;
  multiSelect?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
}

export function TreeView({
  data,
  onNodeClick,
  onNodeExpand,
  defaultExpandedIds = [],
  variant = 'default',
  selectable = false,
  multiSelect = false,
  selectedIds = [],
  onSelectionChange,
  className,
}: TreeViewProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    new Set(defaultExpandedIds)
  );
  const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(
    new Set(selectedIds)
  );

  const handleToggle = (nodeId: string, node: TreeNode) => {
    const newExpanded = new Set(expandedIds);
    const isExpanded = newExpanded.has(nodeId);

    if (isExpanded) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }

    setExpandedIds(newExpanded);
    onNodeExpand?.(node, !isExpanded);
  };

  const handleSelect = (nodeId: string) => {
    const newSelected = new Set(internalSelectedIds);

    if (multiSelect) {
      if (newSelected.has(nodeId)) {
        newSelected.delete(nodeId);
      } else {
        newSelected.add(nodeId);
      }
    } else {
      newSelected.clear();
      newSelected.add(nodeId);
    }

    setInternalSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = internalSelectedIds.has(node.id);

    const paddingLeft = level * 20 + 8;

    return (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors hover:bg-accent',
            isSelected && 'bg-accent',
            variant === 'minimal' && 'hover:bg-transparent hover:text-primary'
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            if (hasChildren) {
              handleToggle(node.id, node);
            }
            onNodeClick?.(node);
            if (selectable) {
              handleSelect(node.id);
            }
          }}
        >
          {/* Expand/Collapse icon */}
          {hasChildren ? (
            <button
              className="p-0.5 hover:bg-muted rounded"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(node.id, node);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {/* Checkbox for selectable */}
          {selectable && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelect(node.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4"
            />
          )}

          {/* Icon */}
          {variant === 'files' ? (
            hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-yellow-500" />
              ) : (
                <Folder className="h-4 w-4 text-yellow-500" />
              )
            ) : (
              <File className="h-4 w-4 text-blue-500" />
            )
          ) : variant === 'minimal' ? (
            <Circle className="h-2 w-2 fill-current" />
          ) : (
            node.icon || <Circle className="h-3 w-3 fill-current" />
          )}

          {/* Label */}
          <span className={cn('text-sm', isSelected && 'font-medium')}>
            {node.label}
          </span>

          {/* Metadata */}
          {node.metadata && (
            <span className="ml-auto text-xs text-muted-foreground">
              {node.metadata.count && `(${node.metadata.count})`}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {data.map((node) => renderNode(node))}
    </div>
  );
}

// Blockchain explorer tree view
export function BlockchainTreeView({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  const data: TreeNode[] = [
    {
      id: 'transactions',
      label: 'Transactions',
      metadata: { count: 1234 },
      children: [
        {
          id: 'sent',
          label: 'Sent',
          metadata: { count: 567 },
        },
        {
          id: 'received',
          label: 'Received',
          metadata: { count: 667 },
        },
      ],
    },
    {
      id: 'tokens',
      label: 'Token Holdings',
      metadata: { count: 45 },
      children: [
        {
          id: 'erc20',
          label: 'ERC-20 Tokens',
          metadata: { count: 32 },
        },
        {
          id: 'erc721',
          label: 'NFTs (ERC-721)',
          metadata: { count: 13 },
        },
      ],
    },
    {
      id: 'contracts',
      label: 'Contract Interactions',
      metadata: { count: 89 },
      children: [
        {
          id: 'uniswap',
          label: 'Uniswap',
          metadata: { count: 45 },
        },
        {
          id: 'aave',
          label: 'Aave',
          metadata: { count: 23 },
        },
        {
          id: 'compound',
          label: 'Compound',
          metadata: { count: 21 },
        },
      ],
    },
  ];

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Wallet Overview</h3>
        <p className="text-xs text-muted-foreground">
          Address: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>
      <TreeView data={data} variant="default" defaultExpandedIds={['transactions']} />
    </div>
  );
}

// Airdrop eligibility tree
export function AirdropEligibilityTree({
  className,
}: {
  className?: string;
}) {
  const data: TreeNode[] = [
    {
      id: 'ethereum',
      label: 'Ethereum Mainnet',
      children: [
        {
          id: 'eth-defi',
          label: 'DeFi Protocols',
          children: [
            {
              id: 'eth-uniswap',
              label: 'Uniswap - Eligible ✅',
            },
            {
              id: 'eth-aave',
              label: 'Aave - Eligible ✅',
            },
            {
              id: 'eth-compound',
              label: 'Compound - Not Eligible ❌',
            },
          ],
        },
        {
          id: 'eth-nft',
          label: 'NFT Platforms',
          children: [
            {
              id: 'eth-opensea',
              label: 'OpenSea - No Airdrop',
            },
            {
              id: 'eth-blur',
              label: 'Blur - Eligible ✅',
            },
          ],
        },
      ],
    },
    {
      id: 'layer2',
      label: 'Layer 2 Networks',
      children: [
        {
          id: 'arbitrum',
          label: 'Arbitrum',
          children: [
            {
              id: 'arb-bridge',
              label: 'Bridge Activity - Eligible ✅',
            },
            {
              id: 'arb-swap',
              label: 'DEX Swaps - Eligible ✅',
            },
          ],
        },
        {
          id: 'optimism',
          label: 'Optimism',
          children: [
            {
              id: 'op-bridge',
              label: 'Bridge Activity - Not Eligible ❌',
            },
          ],
        },
        {
          id: 'base',
          label: 'Base',
          children: [
            {
              id: 'base-activity',
              label: 'On-chain Activity - Eligible ✅',
            },
            {
              id: 'base-nft',
              label: 'NFT Mints - Eligible ✅',
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className={className}>
      <TreeView
        data={data}
        variant="default"
        defaultExpandedIds={['ethereum', 'layer2']}
      />
    </div>
  );
}

// File explorer tree
export function FileExplorerTree({
  className,
}: {
  className?: string;
}) {
  const data: TreeNode[] = [
    {
      id: 'src',
      label: 'src',
      children: [
        {
          id: 'components',
          label: 'components',
          children: [
            {
              id: 'button',
              label: 'Button.tsx',
            },
            {
              id: 'input',
              label: 'Input.tsx',
            },
          ],
        },
        {
          id: 'lib',
          label: 'lib',
          children: [
            {
              id: 'utils',
              label: 'utils.ts',
            },
          ],
        },
        {
          id: 'app',
          label: 'app.tsx',
        },
      ],
    },
    {
      id: 'public',
      label: 'public',
      children: [
        {
          id: 'favicon',
          label: 'favicon.ico',
        },
      ],
    },
  ];

  return (
    <div className={className}>
      <TreeView
        data={data}
        variant="files"
        defaultExpandedIds={['src', 'components']}
      />
    </div>
  );
}

// Selectable tree with checkboxes
export function SelectableTree({
  data,
  onSelectionChange,
  className,
}: {
  data: TreeNode[];
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <TreeView
        data={data}
        variant="default"
        selectable
        multiSelect
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

