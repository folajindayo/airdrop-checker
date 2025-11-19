import { walletService } from "@/lib/services/walletService";

describe("WalletService", () => {
  describe("connectWallet", () => {
    it("returns wallet info on connection", async () => {
      const walletInfo = await walletService.connectWallet();

      expect(walletInfo.address).toBeDefined();
      expect(walletInfo.balance).toBeDefined();
      expect(walletInfo.chainId).toBeDefined();
      expect(walletInfo.connected).toBe(true);
    });

    it("returns valid ethereum address", async () => {
      const walletInfo = await walletService.connectWallet();

      expect(walletInfo.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("disconnectWallet", () => {
    it("disconnects wallet without error", async () => {
      await expect(walletService.disconnectWallet()).resolves.not.toThrow();
    });
  });

  describe("getBalance", () => {
    it("returns balance for address", async () => {
      const balance = await walletService.getBalance("0x1234");

      expect(balance).toBeDefined();
      expect(typeof balance).toBe("string");
    });
  });

  describe("getTransactions", () => {
    it("returns transaction list", async () => {
      const transactions = await walletService.getTransactions("0x1234", 5);

      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBe(5);
    });

    it("returns transactions with required fields", async () => {
      const transactions = await walletService.getTransactions("0x1234");

      transactions.forEach((tx) => {
        expect(tx.hash).toBeDefined();
        expect(tx.from).toBeDefined();
        expect(tx.to).toBeDefined();
        expect(tx.value).toBeDefined();
        expect(tx.timestamp).toBeDefined();
        expect(tx.status).toBeDefined();
      });
    });
  });

  describe("switchNetwork", () => {
    it("switches to requested network", async () => {
      const result = await walletService.switchNetwork(137);

      expect(result).toBe(true);
    });
  });

  describe("isValidAddress", () => {
    it("validates correct ethereum address", () => {
      const valid = walletService.isValidAddress(
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
      );

      expect(valid).toBe(true);
    });

    it("rejects invalid address", () => {
      expect(walletService.isValidAddress("invalid")).toBe(false);
      expect(walletService.isValidAddress("0x123")).toBe(false);
      expect(walletService.isValidAddress("not an address")).toBe(false);
    });
  });
});

