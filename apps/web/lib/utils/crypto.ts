/**
 * Cryptography utility functions
 * Helper functions for hashing and encryption
 */

/**
 * Hash string using SHA-256 (browser-compatible)
 */
export async function hashString(str: string): Promise<string> {
  if (typeof window === "undefined") {
    // Node.js environment
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(str).digest("hex");
  }

  // Browser environment
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate random ID
 */
export function generateId(length: number = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  if (typeof window !== "undefined" && window.crypto) {
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  // Fallback implementation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Base64 encode
 */
export function base64Encode(str: string): string {
  if (typeof window !== "undefined") {
    return btoa(str);
  }
  return Buffer.from(str).toString("base64");
}

/**
 * Base64 decode
 */
export function base64Decode(str: string): string {
  if (typeof window !== "undefined") {
    return atob(str);
  }
  return Buffer.from(str, "base64").toString();
}

/**
 * Encode data to hex
 */
export function toHex(data: string): string {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += data.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return "0x" + result;
}

/**
 * Decode hex to string
 */
export function fromHex(hex: string): string {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  let result = "";

  for (let i = 0; i < cleanHex.length; i += 2) {
    result += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
  }

  return result;
}

/**
 * Simple XOR cipher (for non-sensitive data)
 */
export function simpleEncrypt(text: string, key: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return base64Encode(result);
}

/**
 * Simple XOR decipher (for non-sensitive data)
 */
export function simpleDecrypt(encrypted: string, key: string): string {
  const decoded = base64Decode(encrypted);
  let result = "";
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(
      decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}
