'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/common/skeleton';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface SimulatedInteraction {
  type: 'swap' | 'nft_mint' | 'bridge' | 'lend';
  protocol: string;
  chain?: string;
  count: number;
}

interface SimulationResult {
  currentScore: number;
  simulatedScore: number;
  improvement: number;
  airdrops: Array<{
    projectId: string;
    project: string;
    score: number;
    improvement: number;
  }>;
}

export default function SimulatePage() {
  const { address, isConnected } = useWallet();
  const [interactions, setInteractions] = useState<SimulatedInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const addInteraction = () => {
    setInteractions([
      ...interactions,
      { type: 'swap', protocol: '', chain: undefined, count: 1 },
    ]);
  };

  const removeInteraction = (index: number) => {
    setInteractions(interactions.filter((_, i) => i !== index));
  };

  const updateInteraction = (index: number, field: keyof SimulatedInteraction, value: any) => {
    const updated = [...interactions];
    updated[index] = { ...updated[index], [field]: value };
    setInteractions(updated);
  };

  const runSimulation = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (interactions.length === 0) {
      toast.error('Please add at least one interaction');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          simulatedInteractions: interactions,
        }),
      });

      if (!response.ok) throw new Error('Simulation failed');

      const data = await response.json();
      setResult(data);
      toast.success('Simulation completed');
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Airdrop Simulator</h1>
          <p className="text-muted-foreground">
            Simulate how different interactions would affect your airdrop eligibility
          </p>
        </div>

        <div className="space-y-6">
          {/* Interaction Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Simulated Interactions</CardTitle>
              <CardDescription>
                Add interactions to see how they would impact your eligibility scores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {interactions.map((interaction, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={interaction.type}
                        onValueChange={(value) => updateInteraction(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="swap">Swap</SelectItem>
                          <SelectItem value="nft_mint">NFT Mint</SelectItem>
                          <SelectItem value="bridge">Bridge</SelectItem>
                          <SelectItem value="lend">Lend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Protocol</Label>
                      <Input
                        placeholder="e.g., Uniswap"
                        value={interaction.protocol}
                        onChange={(e) => updateInteraction(index, 'protocol', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Chain</Label>
                      <Select
                        value={interaction.chain || ''}
                        onValueChange={(value) => updateInteraction(index, 'chain', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                          <SelectItem value="base">Base</SelectItem>
                          <SelectItem value="arbitrum">Arbitrum</SelectItem>
                          <SelectItem value="optimism">Optimism</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Count</Label>
                      <Input
                        type="number"
                        min="1"
                        value={interaction.count}
                        onChange={(e) => updateInteraction(index, 'count', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInteraction(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button onClick={addInteraction} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Interaction
              </Button>

              <Button onClick={runSimulation} disabled={loading || interactions.length === 0} className="w-full">
                {loading ? 'Simulating...' : 'Run Simulation'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {loading && (
            <Card>
              <CardContent className="p-8">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Simulation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Score</div>
                    <div className="text-2xl font-bold">{result.currentScore}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Simulated Score</div>
                    <div className="text-2xl font-bold">{result.simulatedScore}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Improvement</div>
                    <div className={`text-2xl font-bold ${result.improvement > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {result.improvement > 0 ? '+' : ''}{result.improvement}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Airdrop Impact</h3>
                  <div className="space-y-2">
                    {result.airdrops
                      .filter((a) => a.improvement !== 0)
                      .sort((a, b) => b.improvement - a.improvement)
                      .slice(0, 10)
                      .map((airdrop) => (
                        <div key={airdrop.projectId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{airdrop.project}</div>
                            <div className="text-sm text-muted-foreground">
                              Score: {airdrop.score}
                            </div>
                          </div>
                          <div className={`font-bold ${airdrop.improvement > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {airdrop.improvement > 0 ? '+' : ''}{airdrop.improvement}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}



