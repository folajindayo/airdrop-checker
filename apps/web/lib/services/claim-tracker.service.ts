/**
 * Claim Tracker Service
 * Business logic for tracking airdrop claims
 * 
 * @module ClaimTrackerService
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
  createdAt: string;
}

export interface ClaimStatistics {
  total: number;
  byStatus: {
    claimed: number;
    pending: number;
    failed: number;
  };
  totalValueUSD: number;
  claimedValueUSD: number;
}

// In-memory storage (in production, use database)
const claimsStore = new Map<string, ClaimEntry[]>();

/**
 * Claim Tracker Service class
 * Provides methods for managing airdrop claim entries
 */
export class ClaimTrackerService {
  /**
   * Add a new claim entry
   * 
   * @param data - Claim entry data
   * @returns Created claim entry
   * @throws {Error} If validation fails or creation fails
   * 
   * @example
   * ```typescript
   * const claim = await ClaimTrackerService.addClaim({
   *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   projectId: 'zora',
   *   projectName: 'Zora',
   *   status: 'claimed',
   *   amount: '1000',
   *   valueUSD: 1000,
   * });
   * ```
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
      createdAt: new Date().toISOString(),
    };

    const claims = claimsStore.get(normalizedAddress) || [];
    claims.push(claim);
    claimsStore.set(normalizedAddress, claims);

    return claim;
  }

  /**
   * Get all claims for an address
   * 
   * @param address - Ethereum address
   * @param filters - Optional filters
   * @returns Array of claim entries
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

    // Sort by creation date (newest first)
    claims.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return claims;
  }

  /**
   * Get a single claim by ID
   * 
   * @param address - Ethereum address
   * @param id - Claim ID
   * @returns Claim entry or null if not found
   */
  static async getClaim(address: string, id: string): Promise<ClaimEntry | null> {
    const claims = claimsStore.get(address.toLowerCase()) || [];
    return claims.find((c) => c.id === id) || null;
  }

  /**
   * Update a claim entry
   * 
   * @param address - Ethereum address
   * @param id - Claim ID
   * @param updates - Update data
   * @returns Updated claim entry or null if not found
   */
  static async updateClaim(
    address: string,
    id: string,
    updates: Partial<Omit<ClaimEntry, 'id' | 'address' | 'createdAt'>>
  ): Promise<ClaimEntry | null> {
    const claims = claimsStore.get(address.toLowerCase()) || [];
    const index = claims.findIndex((c) => c.id === id);

    if (index === -1) {
      return null;
    }

    claims[index] = { ...claims[index], ...updates };
    
    // Update claimedAt if status changed to claimed
    if (updates.status === 'claimed' && !claims[index].claimedAt) {
      claims[index].claimedAt = new Date().toISOString();
    }

    return claims[index];
  }

  /**
   * Delete a claim entry
   * 
   * @param address - Ethereum address
   * @param id - Claim ID
   * @returns True if deleted, false if not found
   */
  static async deleteClaim(address: string, id: string): Promise<boolean> {
    const claims = claimsStore.get(address.toLowerCase()) || [];
    const index = claims.findIndex((c) => c.id === id);

    if (index === -1) {
      return false;
    }

    claims.splice(index, 1);
    return true;
  }

  /**
   * Get claim statistics for an address
   * 
   * @param address - Ethereum address
   * @returns Statistics object
   */
  static async getStatistics(address: string): Promise<ClaimStatistics> {
    const claims = await this.getClaims(address.toLowerCase());

    const byStatus = {
      claimed: 0,
      pending: 0,
      failed: 0,
    };

    let totalValueUSD = 0;
    let claimedValueUSD = 0;

    claims.forEach((claim) => {
      byStatus[claim.status] = (byStatus[claim.status] || 0) + 1;
      totalValueUSD += claim.valueUSD || 0;
      if (claim.status === 'claimed') {
        claimedValueUSD += claim.valueUSD || 0;
      }
    });

    return {
      total: claims.length,
      byStatus,
      totalValueUSD,
      claimedValueUSD,
    };
  }
}
