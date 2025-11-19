import {
  isAirdropStatus,
  isChain,
  isNotificationType,
  isAirdrop,
  isEligibilityResult,
  isEthereumAddress,
  isApiResponse,
  isApiError,
  isSuccessResponse,
  isErrorResponse,
  assertEthereumAddress,
  assertAirdropStatus,
  assertChain,
} from "@/lib/types/guards";
import { ApiResponse, Airdrop } from "@/lib/types/api";

describe("Type Guards", () => {
  describe("isAirdropStatus", () => {
    it("returns true for valid statuses", () => {
      expect(isAirdropStatus("active")).toBe(true);
      expect(isAirdropStatus("upcoming")).toBe(true);
      expect(isAirdropStatus("ended")).toBe(true);
      expect(isAirdropStatus("claimed")).toBe(true);
    });

    it("returns false for invalid statuses", () => {
      expect(isAirdropStatus("invalid")).toBe(false);
      expect(isAirdropStatus(123)).toBe(false);
    });
  });

  describe("isChain", () => {
    it("returns true for valid chains", () => {
      expect(isChain("ethereum")).toBe(true);
      expect(isChain("polygon")).toBe(true);
      expect(isChain("solana")).toBe(true);
    });

    it("returns false for invalid chains", () => {
      expect(isChain("invalid")).toBe(false);
      expect(isChain(123)).toBe(false);
    });
  });

  describe("isNotificationType", () => {
    it("returns true for valid types", () => {
      expect(isNotificationType("success")).toBe(true);
      expect(isNotificationType("error")).toBe(true);
      expect(isNotificationType("warning")).toBe(true);
      expect(isNotificationType("info")).toBe(true);
    });

    it("returns false for invalid types", () => {
      expect(isNotificationType("invalid")).toBe(false);
    });
  });

  describe("isAirdrop", () => {
    const validAirdrop: Airdrop = {
      id: "123",
      name: "Test Airdrop",
      description: "Test",
      chain: "ethereum",
      status: "active",
      totalAmount: "1000000",
      participants: 5000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      requirements: ["Hold tokens"],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };

    it("returns true for valid airdrops", () => {
      expect(isAirdrop(validAirdrop)).toBe(true);
    });

    it("returns false for invalid airdrops", () => {
      expect(isAirdrop({})).toBe(false);
      expect(isAirdrop({ id: "123", name: "Test" })).toBe(false);
      expect(isAirdrop(null)).toBe(false);
    });
  });

  describe("isEligibilityResult", () => {
    it("returns true for valid results", () => {
      const result = {
        eligible: true,
        amount: "100",
        requirements: [{ requirement: "Test", met: true }],
      };
      expect(isEligibilityResult(result)).toBe(true);
    });

    it("returns false for invalid results", () => {
      expect(isEligibilityResult({})).toBe(false);
      expect(isEligibilityResult({ eligible: true })).toBe(false);
    });
  });

  describe("isEthereumAddress", () => {
    it("returns true for valid addresses", () => {
      expect(isEthereumAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")).toBe(
        true
      );
    });

    it("returns false for invalid addresses", () => {
      expect(isEthereumAddress("0x123")).toBe(false);
      expect(isEthereumAddress("invalid")).toBe(false);
    });
  });

  describe("isApiResponse", () => {
    it("returns true for valid API responses", () => {
      expect(isApiResponse({ success: true, data: "test" })).toBe(true);
    });

    it("returns false for invalid responses", () => {
      expect(isApiResponse({})).toBe(false);
    });
  });

  describe("isApiError", () => {
    it("returns true for valid API errors", () => {
      expect(isApiError({ code: "ERR_001", message: "Error" })).toBe(true);
    });

    it("returns false for invalid errors", () => {
      expect(isApiError({ code: "ERR_001" })).toBe(false);
    });
  });

  describe("isSuccessResponse", () => {
    it("returns true for success responses", () => {
      const response: ApiResponse<string> = {
        success: true,
        data: "test",
      };
      expect(isSuccessResponse(response)).toBe(true);
    });

    it("returns false for error responses", () => {
      const response: ApiResponse<string> = {
        success: false,
        error: { code: "ERR", message: "Error" },
      };
      expect(isSuccessResponse(response)).toBe(false);
    });
  });

  describe("isErrorResponse", () => {
    it("returns true for error responses", () => {
      const response: ApiResponse<string> = {
        success: false,
        error: { code: "ERR", message: "Error" },
      };
      expect(isErrorResponse(response)).toBe(true);
    });

    it("returns false for success responses", () => {
      const response: ApiResponse<string> = {
        success: true,
        data: "test",
      };
      expect(isErrorResponse(response)).toBe(false);
    });
  });

  describe("assertEthereumAddress", () => {
    it("does not throw for valid addresses", () => {
      expect(() =>
        assertEthereumAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
      ).not.toThrow();
    });

    it("throws for invalid addresses", () => {
      expect(() => assertEthereumAddress("invalid")).toThrow();
    });
  });

  describe("assertAirdropStatus", () => {
    it("does not throw for valid statuses", () => {
      expect(() => assertAirdropStatus("active")).not.toThrow();
    });

    it("throws for invalid statuses", () => {
      expect(() => assertAirdropStatus("invalid")).toThrow();
    });
  });

  describe("assertChain", () => {
    it("does not throw for valid chains", () => {
      expect(() => assertChain("ethereum")).not.toThrow();
    });

    it("throws for invalid chains", () => {
      expect(() => assertChain("invalid")).toThrow();
    });
  });
});

