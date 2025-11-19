export interface Airdrop {
  id: string;
  name: string;
  description: string;
  chain: string;
  status: "active" | "upcoming" | "ended";
  totalAmount: string;
  participants: number;
  startDate: string;
  endDate: string;
  requirements: string[];
  website?: string;
  twitter?: string;
  discord?: string;
}

export interface EligibilityResult {
  address: string;
  airdropId: string;
  eligible: boolean;
  amount: string;
  checked: string;
  reason?: string;
}

export class AirdropService {
  async getAirdrops(filters?: {
    status?: string;
    chain?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Airdrop[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    // Mock implementation
    const mockAirdrops = Array.from({ length: 50 }, (_, i) => ({
      id: `airdrop-${i}`,
      name: `Airdrop Project ${i + 1}`,
      description: `Description for airdrop ${i + 1}`,
      chain: ["ethereum", "polygon", "arbitrum"][i % 3],
      status: (["active", "upcoming", "ended"][i % 3] as any),
      totalAmount: `${Math.floor(Math.random() * 10000)} tokens`,
      participants: Math.floor(Math.random() * 10000),
      startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: ["Hold tokens", "Complete transactions"],
    }));

    let filteredData = mockAirdrops;

    if (filters?.status) {
      filteredData = filteredData.filter((a) => a.status === filters.status);
    }

    if (filters?.chain) {
      filteredData = filteredData.filter((a) => a.chain === filters.chain);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    };
  }

  async getAirdrop(id: string): Promise<Airdrop | null> {
    // Mock implementation
    return {
      id,
      name: `Airdrop Project ${id}`,
      description: "Detailed description of the airdrop project",
      chain: "ethereum",
      status: "active",
      totalAmount: "100000 tokens",
      participants: 5432,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: [
        "Hold at least 0.1 ETH",
        "Complete on-chain transactions",
        "Join Discord server",
      ],
      website: "https://example.com",
      twitter: "@example",
      discord: "https://discord.gg/example",
    };
  }

  async checkEligibility(address: string, airdropId: string): Promise<EligibilityResult> {
    // Mock implementation
    const isEligible = Math.random() > 0.5;
    const amount = isEligible ? Math.floor(Math.random() * 1000) : 0;

    return {
      address,
      airdropId,
      eligible: isEligible,
      amount: isEligible ? `${amount} tokens` : "0",
      checked: new Date().toISOString(),
      reason: isEligible ? "Meets all requirements" : "Does not meet requirements",
    };
  }

  async getTrendingAirdrops(limit: number = 5): Promise<Airdrop[]> {
    const result = await this.getAirdrops({ status: "active", limit });
    return result.data;
  }
}

export const airdropService = new AirdropService();

