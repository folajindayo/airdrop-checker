'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyAddress } from '@/components/ui/copy-button';
import { ChainDisplay } from '@/components/blockchain/chain-selector';
import { ExternalLink, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  chainId: string | number;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
}

interface TransactionDetailsProps {
  transaction: Transaction;
  explorerUrl?: string;
}

export function TransactionDetails({
  transaction,
  explorerUrl = 'https://etherscan.io/tx',
}: TransactionDetailsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        <div className="flex items-center gap-1">
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </div>
      </Badge>
    );
  };

  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Transaction Details</CardTitle>
          {getStatusBadge(transaction.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Hash */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
          <div className="flex items-center gap-2">
            <CopyAddress address={transaction.hash} />
            <a
              href={`${explorerUrl}/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Chain */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chain</p>
          <ChainDisplay chainId={transaction.chainId} />
        </div>

        {/* From/To Addresses */}
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">From</p>
            <CopyAddress address={transaction.from} />
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">To</p>
            <CopyAddress address={transaction.to} />
          </div>
        </div>

        {/* Value */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Value</p>
          <p className="font-mono text-lg">{transaction.value} ETH</p>
        </div>

        {/* Timestamp */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
          <p className="text-sm">{formatDate(transaction.timestamp)}</p>
        </div>

        {/* Gas Information */}
        {(transaction.gasUsed || transaction.gasPrice) && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {transaction.gasUsed && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gas Used</p>
                <p className="text-sm font-mono">{transaction.gasUsed}</p>
              </div>
            )}
            {transaction.gasPrice && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gas Price</p>
                <p className="text-sm font-mono">{transaction.gasPrice} Gwei</p>
              </div>
            )}
          </div>
        )}

        {/* Block Number */}
        {transaction.blockNumber && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Block Number</p>
            <p className="text-sm font-mono">{transaction.blockNumber.toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for lists
export function TransactionListItem({ transaction }: { transaction: Transaction }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, HH:mm');
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {getStatusIcon(transaction.status)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-mono text-sm truncate">
              {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
            </p>
            <ChainDisplay chainId={transaction.chainId} showIcon={true} />
          </div>
          <p className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-medium">{transaction.value} ETH</p>
      </div>
    </div>
  );
}

// Transaction list component
export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No transactions found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {transactions.map((tx) => (
          <TransactionListItem key={tx.hash} transaction={tx} />
        ))}
      </CardContent>
    </Card>
  );
}

