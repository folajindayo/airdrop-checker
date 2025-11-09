'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gift, CheckCircle2, Clock, XCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AirdropClaim {
  id: string;
  projectId: string;
  projectName: string;
  claimed: boolean;
  claimDate?: string;
  claimAmount?: number;
  claimValueUSD?: number;
  txHash?: string;
  notes?: string;
}

interface AirdropClaimTrackerProps {
  address: string;
  className?: string;
}

const STORAGE_KEY = 'airdrop-claims';

export function AirdropClaimTracker({ address, className = '' }: AirdropClaimTrackerProps) {
  const [claims, setClaims] = useState<AirdropClaim[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClaim, setNewClaim] = useState({
    projectId: '',
    projectName: '',
    claimAmount: '',
    claimValueUSD: '',
    txHash: '',
    notes: '',
  });

  useEffect(() => {
    loadClaims();
  }, [address]);

  function loadClaims() {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${address}`);
      if (stored) {
        setClaims(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load claims:', error);
    }
  }

  function saveClaims(newClaims: AirdropClaim[]) {
    try {
      localStorage.setItem(`${STORAGE_KEY}-${address}`, JSON.stringify(newClaims));
      setClaims(newClaims);
    } catch (error) {
      console.error('Failed to save claims:', error);
      toast.error('Failed to save claim data');
    }
  }

  function handleAddClaim() {
    if (!newClaim.projectId || !newClaim.projectName) {
      toast.error('Please fill in project ID and name');
      return;
    }

    const claim: AirdropClaim = {
      id: `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: newClaim.projectId,
      projectName: newClaim.projectName,
      claimed: true,
      claimDate: new Date().toISOString(),
      claimAmount: newClaim.claimAmount ? parseFloat(newClaim.claimAmount) : undefined,
      claimValueUSD: newClaim.claimValueUSD ? parseFloat(newClaim.claimValueUSD) : undefined,
      txHash: newClaim.txHash || undefined,
      notes: newClaim.notes || undefined,
    };

    saveClaims([...claims, claim]);
    setNewClaim({
      projectId: '',
      projectName: '',
      claimAmount: '',
      claimValueUSD: '',
      txHash: '',
      notes: '',
    });
    setIsDialogOpen(false);
    toast.success('Claim added successfully');
  }

  function handleToggleClaim(id: string) {
    const updated = claims.map((claim) =>
      claim.id === id
        ? { ...claim, claimed: !claim.claimed }
        : claim
    );
    saveClaims(updated);
  }

  function handleDeleteClaim(id: string) {
    const updated = claims.filter((claim) => claim.id !== id);
    saveClaims(updated);
    toast.success('Claim removed');
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalClaimedValue = claims
    .filter((c) => c.claimed && c.claimValueUSD)
    .reduce((sum, c) => sum + (c.claimValueUSD || 0), 0);

  const claimedCount = claims.filter((c) => c.claimed).length;
  const pendingCount = claims.filter((c) => !c.claimed).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Airdrop Claim Tracker
            </CardTitle>
            <CardDescription>Track your claimed airdrops</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Claim
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Airdrop Claim</DialogTitle>
                <DialogDescription>
                  Record a claimed airdrop to track your earnings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project ID</Label>
                  <Input
                    id="projectId"
                    placeholder="e.g., zora"
                    value={newClaim.projectId}
                    onChange={(e) => setNewClaim({ ...newClaim, projectId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., Zora"
                    value={newClaim.projectName}
                    onChange={(e) => setNewClaim({ ...newClaim, projectName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimAmount">Claim Amount</Label>
                    <Input
                      id="claimAmount"
                      type="number"
                      placeholder="0"
                      value={newClaim.claimAmount}
                      onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claimValueUSD">Value (USD)</Label>
                    <Input
                      id="claimValueUSD"
                      type="number"
                      placeholder="0"
                      value={newClaim.claimValueUSD}
                      onChange={(e) => setNewClaim({ ...newClaim, claimValueUSD: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="txHash">Transaction Hash (Optional)</Label>
                  <Input
                    id="txHash"
                    placeholder="0x..."
                    value={newClaim.txHash}
                    onChange={(e) => setNewClaim({ ...newClaim, txHash: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes..."
                    value={newClaim.notes}
                    onChange={(e) => setNewClaim({ ...newClaim, notes: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddClaim} className="w-full">
                  Add Claim
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Claims</p>
            <p className="text-2xl font-bold mt-1">{claims.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 dark:text-green-300">Claimed</p>
            <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
              {claimedCount}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalClaimedValue)}</p>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-2">
          {claims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No claims tracked yet</p>
              <p className="text-sm mt-1">Add your first claim to get started</p>
            </div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-lg",
                  claim.claimed && "bg-green-50/50 dark:bg-green-950/10"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={claim.claimed}
                    onCheckedChange={() => handleToggleClaim(claim.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{claim.projectName}</span>
                      {claim.claimed ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Claimed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {claim.claimDate && (
                        <span>
                          {new Date(claim.claimDate).toLocaleDateString()}
                        </span>
                      )}
                      {claim.claimAmount && (
                        <span>{claim.claimAmount} tokens</span>
                      )}
                      {claim.claimValueUSD && (
                        <span className="font-semibold text-foreground">
                          {formatCurrency(claim.claimValueUSD)}
                        </span>
                      )}
                    </div>
                    {claim.txHash && (
                      <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
                        {claim.txHash}
                      </p>
                    )}
                    {claim.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{claim.notes}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClaim(claim.id)}
                  className="ml-2"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

