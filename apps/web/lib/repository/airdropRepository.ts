import { Airdrop } from "../services/airdropService";

export interface AirdropRepository {
  findById(id: string): Promise<Airdrop | null>;
  findAll(filters?: {
    status?: string;
    chain?: string;
  }): Promise<Airdrop[]>;
  create(airdrop: Omit<Airdrop, "id" | "participants">): Promise<Airdrop>;
  update(id: string, updates: Partial<Airdrop>): Promise<Airdrop | null>;
  delete(id: string): Promise<boolean>;
  incrementParticipants(id: string): Promise<boolean>;
}

export class InMemoryAirdropRepository implements AirdropRepository {
  private airdrops: Map<string, Airdrop> = new Map();

  async findById(id: string): Promise<Airdrop | null> {
    return this.airdrops.get(id) || null;
  }

  async findAll(filters?: {
    status?: string;
    chain?: string;
  }): Promise<Airdrop[]> {
    let airdrops = Array.from(this.airdrops.values());

    if (filters?.status) {
      airdrops = airdrops.filter((a) => a.status === filters.status);
    }

    if (filters?.chain) {
      airdrops = airdrops.filter((a) => a.chain === filters.chain);
    }

    return airdrops;
  }

  async create(airdrop: Omit<Airdrop, "id" | "participants">): Promise<Airdrop> {
    const newAirdrop: Airdrop = {
      ...airdrop,
      id: `airdrop_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      participants: 0,
    };

    this.airdrops.set(newAirdrop.id, newAirdrop);
    return newAirdrop;
  }

  async update(id: string, updates: Partial<Airdrop>): Promise<Airdrop | null> {
    const existing = this.airdrops.get(id);

    if (!existing) {
      return null;
    }

    const updated = { ...existing, ...updates };
    this.airdrops.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.airdrops.delete(id);
  }

  async incrementParticipants(id: string): Promise<boolean> {
    const airdrop = this.airdrops.get(id);

    if (!airdrop) {
      return false;
    }

    airdrop.participants++;
    this.airdrops.set(id, airdrop);
    return true;
  }
}

export const airdropRepository = new InMemoryAirdropRepository();

