/**
 * @fileoverview Tests for cryptographic utilities
 */

import {
  generateRandomString,
  generateToken,
  generateUUID,
  encrypt,
  decrypt,
  encryptWithPassword,
  decryptWithPassword,
  generateEncryptionKey,
  hash,
  hashPassword,
  verifyPassword,
  createHMAC,
  verifyHMAC,
  fingerprint,
  maskSensitiveData,
  generateAPIKey,
  hashAPIKey,
  verifyAPIKey,
  encryptObject,
  decryptObject,
  secureRandomInt,
  generateOTP,
  constantTimeCompare,
  generateNonce,
  generateSalt,
  encryptForStorage,
  decryptFromStorage,
} from '@/lib/utils/crypto';

describe('Cryptographic Utilities', () => {
  describe('Random Generation', () => {
    it('should generate random string of specified length', () => {
      const str = generateRandomString(32);

      expect(str).toHaveLength(32);
      expect(typeof str).toBe('string');
    });

    it('should generate unique random strings', () => {
      const str1 = generateRandomString(32);
      const str2 = generateRandomString(32);

      expect(str1).not.toBe(str2);
    });

    it('should generate secure token', () => {
      const token = generateToken();

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate valid UUID', () => {
      const uuid = generateUUID();

      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('Encryption/Decryption', () => {
    it('should encrypt and decrypt data', () => {
      const key = generateEncryptionKey();
      const data = 'Secret message';

      const encrypted = encrypt(data, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(data);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const key = generateEncryptionKey();
      const data = 'Secret message';

      const encrypted1 = encrypt(data, key);
      const encrypted2 = encrypt(data, key);

      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should fail decryption with wrong key', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      const data = 'Secret message';

      const encrypted = encrypt(data, key1);

      expect(() => decrypt(encrypted, key2)).toThrow();
    });

    it('should handle empty string', () => {
      const key = generateEncryptionKey();
      const data = '';

      const encrypted = encrypt(data, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(data);
    });

    it('should handle long text', () => {
      const key = generateEncryptionKey();
      const data = 'A'.repeat(10000);

      const encrypted = encrypt(data, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(data);
    });

    it('should handle unicode characters', () => {
      const key = generateEncryptionKey();
      const data = '你好世界 🌍 مرحبا العالم';

      const encrypted = encrypt(data, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(data);
    });
  });

  describe('Password-Based Encryption', () => {
    it('should encrypt and decrypt with password', () => {
      const password = 'MySecurePassword123!';
      const data = 'Secret message';

      const encrypted = encryptWithPassword(data, password);
      const decrypted = decryptWithPassword(encrypted, password);

      expect(decrypted).toBe(data);
    });

    it('should fail with wrong password', () => {
      const password1 = 'CorrectPassword';
      const password2 = 'WrongPassword';
      const data = 'Secret message';

      const encrypted = encryptWithPassword(data, password1);

      expect(() => decryptWithPassword(encrypted, password2)).toThrow();
    });

    it('should include salt in encrypted data', () => {
      const password = 'MyPassword';
      const data = 'Secret';

      const encrypted = encryptWithPassword(data, password);

      expect(encrypted.salt).toBeDefined();
    });
  });

  describe('Hashing', () => {
    it('should hash data consistently', () => {
      const data = 'test data';

      const hash1 = hash(data);
      const hash2 = hash(data);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different data', () => {
      const data1 = 'test data 1';
      const data2 = 'test data 2';

      const hash1 = hash(data1);
      const hash2 = hash(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('should support different algorithms', () => {
      const data = 'test data';

      const sha256 = hash(data, { algorithm: 'sha256' });
      const sha512 = hash(data, { algorithm: 'sha512' });

      expect(sha256).not.toBe(sha512);
    });

    it('should support salt', () => {
      const data = 'test data';
      const salt = 'random salt';

      const hash1 = hash(data);
      const hash2 = hash(data, { salt });

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password', () => {
      const password = 'MySecurePassword123!';

      const hashed = hashPassword(password);

      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should verify correct password', () => {
      const password = 'MySecurePassword123!';

      const hashed = hashPassword(password);
      const isValid = verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it('should reject wrong password', () => {
      const password = 'CorrectPassword';
      const wrongPassword = 'WrongPassword';

      const hashed = hashPassword(password);
      const isValid = verifyPassword(wrongPassword, hashed);

      expect(isValid).toBe(false);
    });

    it('should produce different hashes for same password', () => {
      const password = 'MyPassword';

      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('HMAC', () => {
    it('should create HMAC signature', () => {
      const data = 'test data';
      const secret = 'my secret';

      const signature = createHMAC(data, secret);

      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should verify correct HMAC', () => {
      const data = 'test data';
      const secret = 'my secret';

      const signature = createHMAC(data, secret);
      const isValid = verifyHMAC(data, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject wrong signature', () => {
      const data = 'test data';
      const secret = 'my secret';
      const wrongSignature = 'invalid signature';

      const isValid = verifyHMAC(data, wrongSignature, secret);

      expect(isValid).toBe(false);
    });

    it('should reject signature from different secret', () => {
      const data = 'test data';
      const secret1 = 'secret 1';
      const secret2 = 'secret 2';

      const signature = createHMAC(data, secret1);
      const isValid = verifyHMAC(data, signature, secret2);

      expect(isValid).toBe(false);
    });
  });

  describe('Fingerprinting', () => {
    it('should generate fingerprint', () => {
      const data = 'test data';

      const fp = fingerprint(data);

      expect(typeof fp).toBe('string');
      expect(fp.length).toBe(64); // SHA-256 hex length
    });

    it('should be consistent', () => {
      const data = 'test data';

      const fp1 = fingerprint(data);
      const fp2 = fingerprint(data);

      expect(fp1).toBe(fp2);
    });
  });

  describe('Data Masking', () => {
    it('should mask sensitive data', () => {
      const data = '1234567890abcdef';

      const masked = maskSensitiveData(data);

      expect(masked).toMatch(/^1234\*+cdef$/);
    });

    it('should handle short data', () => {
      const data = '123';

      const masked = maskSensitiveData(data);

      expect(masked).toBe('***');
    });

    it('should support custom visible lengths', () => {
      const data = '1234567890abcdef';

      const masked = maskSensitiveData(data, 2, 2);

      expect(masked).toMatch(/^12\*+ef$/);
    });
  });

  describe('API Keys', () => {
    it('should generate API key', () => {
      const apiKey = generateAPIKey();

      expect(apiKey).toMatch(/^sk_/);
    });

    it('should support custom prefix', () => {
      const apiKey = generateAPIKey('pk');

      expect(apiKey).toMatch(/^pk_/);
    });

    it('should hash API key', () => {
      const apiKey = 'sk_test123456';

      const hashed = hashAPIKey(apiKey);

      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(apiKey);
    });

    it('should verify API key', () => {
      const apiKey = generateAPIKey();

      const hashed = hashAPIKey(apiKey);
      const isValid = verifyAPIKey(apiKey, hashed);

      expect(isValid).toBe(true);
    });
  });

  describe('Object Encryption', () => {
    it('should encrypt and decrypt object', () => {
      const key = generateEncryptionKey();
      const obj = { name: 'John', age: 30, active: true };

      const encrypted = encryptObject(obj, key);
      const decrypted = decryptObject(encrypted, key);

      expect(decrypted).toEqual(obj);
    });

    it('should handle nested objects', () => {
      const key = generateEncryptionKey();
      const obj = {
        user: { name: 'John', email: 'john@example.com' },
        settings: { theme: 'dark', notifications: true },
      };

      const encrypted = encryptObject(obj, key);
      const decrypted = decryptObject(encrypted, key);

      expect(decrypted).toEqual(obj);
    });

    it('should handle arrays', () => {
      const key = generateEncryptionKey();
      const obj = { items: [1, 2, 3, 4, 5] };

      const encrypted = encryptObject(obj, key);
      const decrypted = decryptObject(encrypted, key);

      expect(decrypted).toEqual(obj);
    });
  });

  describe('Secure Random Numbers', () => {
    it('should generate number in range', () => {
      const min = 10;
      const max = 20;

      for (let i = 0; i < 100; i++) {
        const num = secureRandomInt(min, max);
        expect(num).toBeGreaterThanOrEqual(min);
        expect(num).toBeLessThanOrEqual(max);
      }
    });

    it('should generate different numbers', () => {
      const numbers = new Set();

      for (let i = 0; i < 100; i++) {
        numbers.add(secureRandomInt(1, 1000));
      }

      expect(numbers.size).toBeGreaterThan(50);
    });
  });

  describe('OTP Generation', () => {
    it('should generate OTP of specified length', () => {
      const otp = generateOTP(6);

      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();

      expect(otp1).not.toBe(otp2);
    });

    it('should support custom length', () => {
      const otp = generateOTP(8);

      expect(otp).toHaveLength(8);
    });
  });

  describe('Constant-Time Comparison', () => {
    it('should return true for equal strings', () => {
      const str = 'test string';

      const result = constantTimeCompare(str, str);

      expect(result).toBe(true);
    });

    it('should return false for different strings', () => {
      const str1 = 'test string 1';
      const str2 = 'test string 2';

      const result = constantTimeCompare(str1, str2);

      expect(result).toBe(false);
    });

    it('should return false for different length strings', () => {
      const str1 = 'short';
      const str2 = 'much longer string';

      const result = constantTimeCompare(str1, str2);

      expect(result).toBe(false);
    });
  });

  describe('Nonce Generation', () => {
    it('should generate nonce', () => {
      const nonce = generateNonce();

      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('Salt Generation', () => {
    it('should generate salt', () => {
      const salt = generateSalt();

      expect(Buffer.isBuffer(salt)).toBe(true);
      expect(salt.length).toBeGreaterThan(0);
    });

    it('should generate different salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      expect(salt1.equals(salt2)).toBe(false);
    });
  });

  describe('Storage Encryption', () => {
    it('should encrypt for storage with metadata', () => {
      const key = generateEncryptionKey();
      const data = 'Secret data';

      const encrypted = encryptForStorage(data, key);

      expect(encrypted.version).toBe('1.0');
      expect(encrypted.algorithm).toBe('aes-256-gcm');
    });

    it('should decrypt from storage', () => {
      const key = generateEncryptionKey();
      const data = 'Secret data';

      const encrypted = encryptForStorage(data, key);
      const decrypted = decryptFromStorage(encrypted, key);

      expect(decrypted).toBe(data);
    });
  });

  describe('Edge Cases', () => {
    it('should handle encryption with hex key string', () => {
      const key = generateEncryptionKey();
      const keyHex = key.toString('hex');
      const data = 'Test data';

      const encrypted = encrypt(data, keyHex);
      const decrypted = decrypt(encrypted, keyHex);

      expect(decrypted).toBe(data);
    });

    it('should reject invalid key length', () => {
      const shortKey = Buffer.from('short');
      const data = 'Test data';

      expect(() => encrypt(data, shortKey)).toThrow();
    });

    it('should handle very long passwords', () => {
      const longPassword = 'A'.repeat(1000);
      const data = 'Test data';

      const encrypted = encryptWithPassword(data, longPassword);
      const decrypted = decryptWithPassword(encrypted, longPassword);

      expect(decrypted).toBe(data);
    });
  });
});

