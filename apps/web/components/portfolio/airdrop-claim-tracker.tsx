'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/common/skeleton';
import { Plus, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AirdropClaimTrackerProps {
  address: string;
}

interface HistoryEntry {
  id: string;
  projectId: string;
  projectName: string;
  status: 'claimed' | 'eligible' | 'missed';
  claimedAt?: string;
  amount?: string;
  value?: number;
  txHash?: string;
  notes?: string;
}

interface HistoryStats {
  total: number;
  claimed: number;
  eligible: number;
  missed: number;
  totalValue: number;
}

export function AirdropClaimTracker({ address }: AirdropClaimTrackerProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    status: 'claimed' as 'claimed' | 'eligible' | 'missed',
    amount: '',
    value: '',
    txHash: '',
    notes: '',
  });

  useEffect(() => {
    fetchHistory();
  }, [address]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const response = await fetch(`/api/history/${address}`);
      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      setHistory(data.history || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addEntry() {
    if (!formData.projectId || !formData.projectName) {
      toast.error('Project ID and name are required');
      return;
    }

    try {
      const response = await fetch(`/api/history/${address}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: formData.value ? parseFloat(formData.value) : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to add entry');

      toast.success('History entry added');
      setDialogOpen(false);
      setFormData({
        projectId: '',
        projectName: '',
        status: 'claimed',
        amount: '',
        value: '',
        txHash: '',
        notes: '',
      });
      fetchHistory();
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add entry');
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
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Claimed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.claimed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Eligible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.eligible}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Entry Dialog */}
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Claim Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Airdrop Claim Entry</DialogTitle>
              <DialogDescription>
                Track your airdrop claims and eligibility
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Project ID</Label>
                <Input
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  placeholder="e.g., zora"
                />
              </div>
              <div>
                <Label>Project Name</Label>
                <Input
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g., Zora"
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="claimed">Claimed</option>
                  <option value="eligible">Eligible</option>
                  <option value="missed">Missed</option>
                </select>
              </div>
              <div>
                <Label>Amount (optional)</Label>
                <Input
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g., 1000"
                />
              </div>
              <div>
                <Label>Value USD (optional)</Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <Label>Transaction Hash (optional)</Label>
                <Input
                  value={formData.txHash}
                  onChange={(e) => setFormData({ ...formData, txHash: e.target.value })}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <Button onClick={addEntry} className="w-full">
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Claim History</CardTitle>
          <CardDescription>Track all your airdrop claims and eligibility</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{entry.projectName}</div>
                      <Badge
                        variant={
                          entry.status === 'claimed'
                            ? 'default'
                            : entry.status === 'eligible'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {entry.status === 'claimed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {entry.status === 'eligible' && <Clock className="h-3 w-3 mr-1" />}
                        {entry.status === 'missed' && <XCircle className="h-3 w-3 mr-1" />}
                        {entry.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {entry.claimedAt && (
                        <span>Claimed: {new Date(entry.claimedAt).toLocaleDateString()}</span>
                      )}
                      {entry.amount && <span className="ml-2">Amount: {entry.amount}</span>}
                      {entry.value && (
                        <span className="ml-2">Value: ${entry.value.toLocaleString()}</span>
                      )}
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>
                    )}
                  </div>
                  {entry.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No claim history yet. Add your first entry above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
