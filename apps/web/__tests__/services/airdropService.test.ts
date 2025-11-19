import { airdropService } from "@/lib/services/airdropService";

describe("AirdropService", () => {
  describe("getAirdrops", () => {
    it("returns paginated airdrop data", async () => {
      const result = await airdropService.getAirdrops();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    it("filters by status", async () => {
      const result = await airdropService.getAirdrops({ status: "active" });

      result.data.forEach((airdrop) => {
        expect(airdrop.status).toBe("active");
      });
    });

    it("filters by chain", async () => {
      const result = await airdropService.getAirdrops({ chain: "ethereum" });

      result.data.forEach((airdrop) => {
        expect(airdrop.chain).toBe("ethereum");
      });
    });

    it("respects pagination parameters", async () => {
      const result = await airdropService.getAirdrops({ page: 2, limit: 5 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getAirdrop", () => {
    it("returns single airdrop details", async () => {
      const airdrop = await airdropService.getAirdrop("test-id");

      expect(airdrop).toBeDefined();
      expect(airdrop?.id).toBe("test-id");
      expect(airdrop?.name).toBeDefined();
      expect(airdrop?.requirements).toBeDefined();
    });
  });

  describe("checkEligibility", () => {
    it("checks eligibility for address", async () => {
      const result = await airdropService.checkEligibility(
        "0x1234",
        "airdrop-1"
      );

      expect(result.address).toBe("0x1234");
      expect(result.airdropId).toBe("airdrop-1");
      expect(typeof result.eligible).toBe("boolean");
      expect(result.amount).toBeDefined();
      expect(result.reason).toBeDefined();
    });

    it("returns correct eligibility format", async () => {
      const result = await airdropService.checkEligibility(
        "0x5678",
        "airdrop-2"
      );

      expect(result.checked).toBeDefined();
      const checked = new Date(result.checked);
      expect(checked.toString()).not.toBe("Invalid Date");
    });
  });

  describe("getTrendingAirdrops", () => {
    it("returns trending airdrops", async () => {
      const trending = await airdropService.getTrendingAirdrops(5);

      expect(Array.isArray(trending)).toBe(true);
      expect(trending.length).toBeLessThanOrEqual(5);
    });

    it("returns only active airdrops", async () => {
      const trending = await airdropService.getTrendingAirdrops();

      trending.forEach((airdrop) => {
        expect(airdrop.status).toBe("active");
      });
    });
  });
});

