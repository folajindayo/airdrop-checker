import {
  isValidAddress,
  isValidTxHash,
  truncateAddress,
  formatWei,
  toWei,
  getExplorerUrl,
  getChainName,
  addressesEqual,
  getChainIcon,
} from "@/lib/utils/blockchain";

describe("Blockchain utilities", () => {
  describe("isValidAddress", () => {
    it("validates Ethereum addresses", () => {
      expect(isValidAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")).toBe(false); // too short
      expect(isValidAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0")).toBe(true);
      expect(isValidAddress("not an address")).toBe(false);
    });
  });

  describe("isValidTxHash", () => {
    it("validates transaction hashes", () => {
      const validHash = "0x" + "a".repeat(64);
      const invalidHash = "0x" + "a".repeat(63);

      expect(isValidTxHash(validHash)).toBe(true);
      expect(isValidTxHash(invalidHash)).toBe(false);
    });
  });

  describe("truncateAddress", () => {
    it("truncates addresses for display", () => {
      const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";

      expect(truncateAddress(address)).toBe("0x742d...bEb0");
      expect(truncateAddress(address, 4, 4)).toBe("0x74...bEb0");
    });

    it("handles short addresses", () => {
      const short = "0x1234";
      expect(truncateAddress(short)).toBe(short);
    });
  });

  describe("formatWei", () => {
    it("converts wei to ether", () => {
      expect(formatWei("1000000000000000000")).toBe("1.000000");
      expect(formatWei("500000000000000000")).toBe("0.500000");
    });
  });

  describe("toWei", () => {
    it("converts ether to wei", () => {
      const result = toWei("1");
      expect(result).toBe("1000000000000000000");
    });
  });

  describe("getExplorerUrl", () => {
    it("generates explorer URLs", () => {
      const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";

      expect(getExplorerUrl(1, "address", address)).toContain("etherscan.io");
      expect(getExplorerUrl(137, "address", address)).toContain("polygonscan.com");
    });
  });

  describe("getChainName", () => {
    it("returns chain names", () => {
      expect(getChainName(1)).toBe("Ethereum");
      expect(getChainName(137)).toBe("Polygon");
      expect(getChainName(999999)).toBe("Unknown");
    });
  });

  describe("addressesEqual", () => {
    it("compares addresses case-insensitively", () => {
      const addr1 = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
      const addr2 = "0x742D35CC6634C0532925A3B844BC9E7595F0BEB0";

      expect(addressesEqual(addr1, addr2)).toBe(true);
      expect(addressesEqual(addr1, "0x0000000000000000000000000000000000000000")).toBe(false);
    });
  });

  describe("getChainIcon", () => {
    it("returns chain icons", () => {
      expect(getChainIcon(1)).toBe("⟠");
      expect(getChainIcon(137)).toBe("⬢");
      expect(getChainIcon(999999)).toBe("⛓️");
    });
  });
});

