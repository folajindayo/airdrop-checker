import {
  formatCompactNumber,
  formatCurrency,
  formatPercentage,
  formatAddress,
  formatTxHash,
  formatTokenAmount,
} from "../../lib/utils/format";

describe("Format Utilities", () => {
  describe("formatCompactNumber", () => {
    it("should format billions", () => {
      expect(formatCompactNumber(1_500_000_000)).toBe("1.5B");
    });

    it("should format millions", () => {
      expect(formatCompactNumber(2_500_000)).toBe("2.5M");
    });

    it("should format thousands", () => {
      expect(formatCompactNumber(3_500)).toBe("3.5K");
    });

    it("should not format small numbers", () => {
      expect(formatCompactNumber(500)).toBe("500");
    });
  });

  describe("formatCurrency", () => {
    it("should format USD currency", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("1,234.56");
    });
  });

  describe("formatPercentage", () => {
    it("should format percentage", () => {
      expect(formatPercentage(0.5)).toBe("50.00%");
      expect(formatPercentage(0.333, 1)).toBe("33.3%");
    });
  });

  describe("formatAddress", () => {
    it("should truncate address", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const result = formatAddress(address);
      expect(result).toBe("0x1234...5678");
    });

    it("should not truncate short addresses", () => {
      const address = "0x123456";
      expect(formatAddress(address)).toBe(address);
    });
  });

  describe("formatTxHash", () => {
    it("should format transaction hash", () => {
      const hash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      const result = formatTxHash(hash);
      expect(result.length).toBeLessThan(hash.length);
      expect(result).toContain("...");
    });
  });

  describe("formatTokenAmount", () => {
    it("should format token amount with decimals", () => {
      const result = formatTokenAmount("1000000000000000000", 18, 2);
      expect(result).toBe("1.00");
    });

    it("should handle different decimal places", () => {
      const result = formatTokenAmount(1000000, 6, 2);
      expect(result).toBe("1.00");
    });
  });
});
