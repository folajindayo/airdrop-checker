/**
 * Claim Tracker Service
 * Business logic for tracking airdrop claims
 */

export interface ClaimEntry {
  id: string;
  address: string;
  projectId: string;
  projectName: string;
  status: 'claimed' | 'pending' | 'failed';
  amount: string;
  valueUSD: number;
  txHash?: string;
  claimedAt?: string;
  notes?: string;
}

export interface ClaimStatistics {
  totalClaims: number;
  totalValueUSD: number;
  claimedCount: number;
  pendingCount: number;
  failedCount: number;
  claimedValueUSD: number;
  pendingValueUSD: number;
}

// In-memory storage (in production, use database)
const claimsStore = new Map<string, ClaimEntry[]>();

export class ClaimTrackerService {
  /**
   * Add a new claim entry
   */
  static async addClaim(data: {
    address: string;
    projectId: string;
    projectName: string;
    status: 'claimed' | 'pending' | 'failed';
    amount?: string;
    valueUSD?: number;
    txHash?: string;
    notes?: string;
  }): Promise<ClaimEntry> {
    const normalizedAddress = data.address.toLowerCase();
    
    const id = `claim-${normalizedAddress}-${Date.now()}`;
    const claim: ClaimEntry = {
      id,
      address: normalizedAddress,
      projectId: data.projectId,
      projectName: data.projectName,
      status: data.status,
      amount: data.amount || '0',
      valueUSD: data.valueUSD || 0,
      txHash: data.txHash,
      claimedAt: data.status === 'claimed' ? new Date().toISOString() : undefined,
      notes: data.notes,
    };

    const claims = claimsStore.get(normalizedAddress) || [];
    claims.push(claim);
    claimsStore.set(normalizedAddress, claims);

    return claim;
  }

  /**
   * Get all claims for an address
   */
  static async getClaims(address: string, filters?: {
    status?: string;
    projectId?: string;
  }): Promise<ClaimEntry[]> {
    const normalizedAddress = address.toLowerCase();
    let claims = claimsStore.get(normalizedAddress) || [];

    if (filters?.status) {
      claims = claims.filter((c) => c.status === filters.status);
    }

    if (filters?.projectId) {
      claims = claims.filter((c) => c.projectId === filters.projectId);
    }

    return claims.sort((a, b) => {
      const timeA = a.claimedAt ? new Date(a.claimedAt).getTime() : 0;
      const timeB = b.claimedAt ? new Date(b.claimedAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  /**
   * Update a claim entry
   */
  static async updateClaim(
    address: string,
    claimId: string,
    updates: Partial<Omit<ClaimEntry, 'id' | 'address'>>
  ): Promise<ClaimEntry | null> {
    const normalizedAddress = address.toLowerCase();
    const claims = claimsStore.get(normalizedAddress);

    if (!claims) {
      return null;
    }

    const claimIndex = claims.findIndex((c) => c.id === claimId);
    if (claimIndex === -1) {
      return null;
    }

    const updatedClaim = {
      ...claims[claimIndex],
      ...updates,
      claimedAt:
        updates.status === 'claimed' && !claims[claimIndex].claimedAt
          ? new Date().toISOString()
          : claims[claimIndex].claimedAt,
    };

    claims[claimIndex] = updatedClaim;
    claimsStore.set(normalizedAddress, claims);

    return updatedClaim;
  }

  /**
   * Delete a claim entry
   */
  static async deleteClaim(address: string, claimId: string): Promise<boolean> {
    const normalizedAddress = address.toLowerCase();
    const claims = claimsStore.get(normalizedAddress);

    if (!claims) {
      return false;
    }

    const filteredClaims = claims.filter((c) => c.id !== claimId);
    
    if (filteredClaims.length === claims.length) {
      return false; // Claim not found
    }

    claimsStore.set(normalizedAddress, filteredClaims);
    return true;
  }

  /**
   * Get claim statistics for an address
   */
  static async getStatistics(address: string): Promise<ClaimStatistics> {
    const normalizedAddress = address.toLowerCase();
    const claims = claimsStore.get(normalizedAddress) || [];

    const stats: ClaimStatistics = {
      totalClaims: claims.length,
      totalValueUSD: 0,
      claimedCount: 0,
      pendingCount: 0,
      failedCount: 0,
      claimedValueUSD: 0,
      pendingValueUSD: 0,
    };

    claims.forEach((claim) => {
      stats.totalValueUSD += claim.valueUSD;

      switch (claim.status) {
        case 'claimed':
          stats.claimedCount++;
          stats.claimedValueUSD += claim.valueUSD;
          break;
        case 'pending':
          stats.pendingCount++;
          stats.pendingValueUSD += claim.valueUSD;
          break;
        case 'failed':
          stats.failedCount++;
          break;
      }
    });

    return stats;
  }
}

