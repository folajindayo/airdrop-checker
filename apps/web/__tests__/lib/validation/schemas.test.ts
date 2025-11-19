import {
  addressSchema,
  airdropStatusSchema,
  chainSchema,
  airdropFiltersSchema,
  createAirdropSchema,
  eligibilityCheckSchema,
  paginationSchema,
  sortSchema,
} from "@/lib/validation/schemas";

describe("Validation Schemas", () => {
  describe("addressSchema", () => {
    it("validates valid Ethereum addresses", () => {
      const validAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
      expect(() => addressSchema.parse(validAddress)).not.toThrow();
    });

    it("rejects invalid addresses", () => {
      expect(() => addressSchema.parse("invalid")).toThrow();
      expect(() => addressSchema.parse("0x123")).toThrow();
    });
  });

  describe("airdropStatusSchema", () => {
    it("validates valid statuses", () => {
      expect(() => airdropStatusSchema.parse("active")).not.toThrow();
      expect(() => airdropStatusSchema.parse("upcoming")).not.toThrow();
      expect(() => airdropStatusSchema.parse("ended")).not.toThrow();
      expect(() => airdropStatusSchema.parse("claimed")).not.toThrow();
    });

    it("rejects invalid statuses", () => {
      expect(() => airdropStatusSchema.parse("invalid")).toThrow();
    });
  });

  describe("chainSchema", () => {
    it("validates valid chains", () => {
      expect(() => chainSchema.parse("ethereum")).not.toThrow();
      expect(() => chainSchema.parse("polygon")).not.toThrow();
      expect(() => chainSchema.parse("solana")).not.toThrow();
    });

    it("rejects invalid chains", () => {
      expect(() => chainSchema.parse("invalid")).toThrow();
    });
  });

  describe("airdropFiltersSchema", () => {
    it("validates empty filters", () => {
      expect(() => airdropFiltersSchema.parse({})).not.toThrow();
    });

    it("validates partial filters", () => {
      const filters = {
        status: ["active", "upcoming"],
        chain: ["ethereum", "polygon"],
        minAmount: 100,
      };
      expect(() => airdropFiltersSchema.parse(filters)).not.toThrow();
    });

    it("rejects invalid amount ranges", () => {
      expect(() => airdropFiltersSchema.parse({ minAmount: -1 })).toThrow();
    });
  });

  describe("createAirdropSchema", () => {
    const validAirdrop = {
      name: "Test Airdrop",
      description: "Test description",
      chain: "ethereum" as const,
      status: "active" as const,
      totalAmount: "1000000",
      participants: 5000,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      requirements: ["Hold 100 tokens", "Complete KYC"],
    };

    it("validates valid airdrop data", () => {
      expect(() => createAirdropSchema.parse(validAirdrop)).not.toThrow();
    });

    it("requires at least one requirement", () => {
      const invalid = { ...validAirdrop, requirements: [] };
      expect(() => createAirdropSchema.parse(invalid)).toThrow();
    });

    it("validates optional URLs", () => {
      const withUrls = {
        ...validAirdrop,
        logo: "https://example.com/logo.png",
        website: "https://example.com",
        twitter: "https://twitter.com/example",
      };
      expect(() => createAirdropSchema.parse(withUrls)).not.toThrow();
    });
  });

  describe("eligibilityCheckSchema", () => {
    const validCheck = {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      airdropId: "550e8400-e29b-41d4-a716-446655440000",
    };

    it("validates valid eligibility check", () => {
      expect(() => eligibilityCheckSchema.parse(validCheck)).not.toThrow();
    });

    it("requires valid UUID", () => {
      const invalid = { ...validCheck, airdropId: "not-a-uuid" };
      expect(() => eligibilityCheckSchema.parse(invalid)).toThrow();
    });
  });

  describe("paginationSchema", () => {
    it("uses defaults", () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("validates custom values", () => {
      const result = paginationSchema.parse({ page: 3, limit: 50 });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
    });

    it("rejects invalid pagination", () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow();
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
    });
  });

  describe("sortSchema", () => {
    it("uses defaults", () => {
      const result = sortSchema.parse({});
      expect(result.sortBy).toBe("date");
      expect(result.sortOrder).toBe("desc");
    });

    it("validates custom values", () => {
      const result = sortSchema.parse({
        sortBy: "amount",
        sortOrder: "asc",
      });
      expect(result.sortBy).toBe("amount");
      expect(result.sortOrder).toBe("asc");
    });
  });
});

