import {
  isValidAddress,
  isValidTxHash,
  isValidEmail,
  isValidUrl,
  isValidENS,
  isEmpty,
  isInRange,
  hasRequiredFields,
} from "../../lib/utils/validation";

describe("Validation Utilities", () => {
  describe("isValidAddress", () => {
    it("should validate correct addresses", () => {
      expect(isValidAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(true);
    });

    it("should reject invalid addresses", () => {
      expect(isValidAddress("0x123")).toBe(false);
      expect(isValidAddress("invalid")).toBe(false);
      expect(isValidAddress("")).toBe(false);
    });
  });

  describe("isValidTxHash", () => {
    it("should validate correct tx hashes", () => {
      const hash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      expect(isValidTxHash(hash)).toBe(true);
    });

    it("should reject invalid tx hashes", () => {
      expect(isValidTxHash("0x123")).toBe(false);
      expect(isValidTxHash("invalid")).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user+tag@domain.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
    });
  });

  describe("isValidUrl", () => {
    it("should validate correct URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
    });
  });

  describe("isValidENS", () => {
    it("should validate correct ENS domains", () => {
      expect(isValidENS("vitalik.eth")).toBe(true);
      expect(isValidENS("my-domain.eth")).toBe(true);
    });

    it("should reject invalid ENS domains", () => {
      expect(isValidENS("domain.com")).toBe(false);
      expect(isValidENS("invalid")).toBe(false);
      expect(isValidENS("CAPS.eth")).toBe(false);
    });
  });

  describe("isEmpty", () => {
    it("should detect empty strings", () => {
      expect(isEmpty("")).toBe(true);
      expect(isEmpty("   ")).toBe(true);
    });

    it("should detect non-empty strings", () => {
      expect(isEmpty("text")).toBe(false);
      expect(isEmpty(" text ")).toBe(false);
    });
  });

  describe("isInRange", () => {
    it("should validate numbers in range", () => {
      expect(isInRange(5, 0, 10)).toBe(true);
      expect(isInRange(0, 0, 10)).toBe(true);
      expect(isInRange(10, 0, 10)).toBe(true);
    });

    it("should reject numbers out of range", () => {
      expect(isInRange(-1, 0, 10)).toBe(false);
      expect(isInRange(11, 0, 10)).toBe(false);
    });
  });

  describe("hasRequiredFields", () => {
    it("should validate objects with required fields", () => {
      const obj = { name: "John", age: 30, email: "john@example.com" };
      expect(hasRequiredFields(obj, ["name", "age"])).toBe(true);
    });

    it("should reject objects missing required fields", () => {
      const obj = { name: "John", age: null };
      expect(hasRequiredFields(obj, ["name", "age", "email"])).toBe(false);
    });
  });
});
