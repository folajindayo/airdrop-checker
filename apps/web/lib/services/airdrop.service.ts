/**
 * Airdrop Service
 */

export interface Airdrop {
  id: string;
  name: string;
  token: string;
  amount: string;
  eligibility: boolean;
  claimUrl: string;
  deadline?: Date;
}

export class AirdropService {
  async checkEligibility(address: string): Promise<Airdrop[]> {
    const response = await fetch(`/api/eligibility?address=${address}`);
    if (!response.ok) throw new Error('Failed to check eligibility');
    return response.json();
  }

  async claimAirdrop(airdropId: string, address: string): Promise<string> {
    const response = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ airdropId, address }),
    });
    if (!response.ok) throw new Error('Failed to claim airdrop');
    const data = await response.json();
    return data.txHash;
  }
}

