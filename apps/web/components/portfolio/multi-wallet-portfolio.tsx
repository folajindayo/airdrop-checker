'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/common/skeleton';
import { Plus, Trash2, Wallet, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Wallet {
  id: string;
  address: string;
  label?: string;
  createdAt: string;
  lastChecked?: string;
}

export function MultiWalletPortfolio() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState({ address: '', label: '' });

  useEffect(() => {
    fetchWallets();
  }, []);

  async function fetchWallets() {
    setLoading(true);
    try {
      const response = await fetch('/api/wallets?userId=default');
      if (!response.ok) throw new Error('Failed to fetch wallets');

      const data = await response.json();
      setWallets(data.wallets || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addWallet() {
    if (!newWallet.address) {
      toast.error('Address is required');
      return;
    }

    try {
      const response = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: newWallet.address,
          label: newWallet.label || `Wallet ${wallets.length + 1}`,
          userId: 'default',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add wallet');
      }

      toast.success('Wallet added');
      setDialogOpen(false);
      setNewWallet({ address: '', label: '' });
      fetchWallets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add wallet');
    }
  }

  async function removeWallet(walletId: string) {
    try {
      const response = await fetch(`/api/wallets?id=${walletId}&userId=default`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove wallet');

      toast.success('Wallet removed');
      fetchWallets();
    } catch (error) {
      toast.error('Failed to remove wallet');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Wallet Portfolio</h2>
          <p className="text-muted-foreground">Manage and track up to 10 wallets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={wallets.length >= 10}>
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Wallet</DialogTitle>
              <DialogDescription>
                Add a wallet address to track (max 10 wallets)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Wallet Address</Label>
                <Input
                  value={newWallet.address}
                  onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label>Label (optional)</Label>
                <Input
                  value={newWallet.label}
                  onChange={(e) => setNewWallet({ ...newWallet, label: e.target.value })}
                  placeholder="e.g., Main Wallet"
                />
              </div>
              <Button onClick={addWallet} className="w-full">
                Add Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallets List */}
      {wallets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    {wallet.label || 'Unnamed Wallet'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeWallet(wallet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="font-mono text-xs break-all">
                  {wallet.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Added</span>
                    <span>{new Date(wallet.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => window.open(`/dashboard?address=${wallet.address}`, '_blank')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No wallets added yet</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
