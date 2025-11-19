import {
  generateId,
  generateUUID,
  base64Encode,
  base64Decode,
  toHex,
  fromHex,
  simpleEncrypt,
  simpleDecrypt,
} from "@/lib/utils/crypto";

describe("Crypto utilities", () => {
  describe("generateId", () => {
    it("generates random IDs", () => {
      const id1 = generateId(16);
      const id2 = generateId(16);

      expect(id1.length).toBe(16);
      expect(id2.length).toBe(16);
      expect(id1).not.toBe(id2);
    });

    it("generates IDs of specified length", () => {
      expect(generateId(8).length).toBe(8);
      expect(generateId(32).length).toBe(32);
    });
  });

  describe("generateUUID", () => {
    it("generates valid UUIDs", () => {
      const uuid = generateUUID();

      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it("generates unique UUIDs", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe("base64 encoding and decoding", () => {
    it("encodes strings to base64", () => {
      const text = "Hello, World!";
      const encoded = base64Encode(text);

      expect(encoded).toBe(btoa(text));
    });

    it("decodes base64 strings", () => {
      const text = "Hello, World!";
      const encoded = base64Encode(text);
      const decoded = base64Decode(encoded);

      expect(decoded).toBe(text);
    });
  });

  describe("hex encoding and decoding", () => {
    it("converts string to hex", () => {
      const text = "Hello";
      const hex = toHex(text);

      expect(hex).toMatch(/^0x[0-9a-f]+$/);
    });

    it("converts hex to string", () => {
      const text = "Hello";
      const hex = toHex(text);
      const decoded = fromHex(hex);

      expect(decoded).toBe(text);
    });

    it("handles hex with or without 0x prefix", () => {
      const hex = "48656c6c6f";
      const result = fromHex(hex);

      expect(result).toBe("Hello");
    });
  });

  describe("simple encryption and decryption", () => {
    it("encrypts and decrypts text", () => {
      const text = "Secret message";
      const key = "password123";

      const encrypted = simpleEncrypt(text, key);
      expect(encrypted).not.toBe(text);

      const decrypted = simpleDecrypt(encrypted, key);
      expect(decrypted).toBe(text);
    });

    it("produces different output for different keys", () => {
      const text = "Secret";
      const key1 = "password1";
      const key2 = "password2";

      const encrypted1 = simpleEncrypt(text, key1);
      const encrypted2 = simpleEncrypt(text, key2);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });
});
