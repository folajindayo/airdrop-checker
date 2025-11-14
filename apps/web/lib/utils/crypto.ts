/**
 * @fileoverview Cryptographic utilities for encryption, hashing, and secure operations
 * Implements industry-standard cryptography for data protection
 */

import crypto from 'crypto';
import { logger } from '../monitoring/logger';

/**
 * Encryption algorithm configuration
 */
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Encrypted content (base64) */
  encrypted: string;
  /** Initialization vector (base64) */
  iv: string;
  /** Authentication tag (base64) */
  authTag: string;
  /** Salt used for key derivation (base64), optional */
  salt?: string;
}

/**
 * Hash configuration options
 */
export interface HashOptions {
  /** Hash algorithm (default: sha256) */
  algorithm?: 'sha256' | 'sha512' | 'sha384';
  /** Output encoding (default: hex) */
  encoding?: 'hex' | 'base64';
  /** Add salt to hash */
  salt?: string;
}

/**
 * Generate a cryptographically secure random string
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Generate a cryptographically secure random token
 */
export function generateToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/**
 * Generate a secure random UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Derive encryption key from password using PBKDF2
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(data: string, key: Buffer | string): EncryptedData {
  try {
    // Convert key to Buffer if string
    const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key;

    if (keyBuffer.length !== KEY_LENGTH) {
      throw new Error(`Key must be ${KEY_LENGTH} bytes`);
    }

    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final(),
    ]);

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  } catch (error) {
    logger.error('Encryption failed', { error });
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Encrypt data with password (derives key automatically)
 */
export function encryptWithPassword(
  data: string,
  password: string
): EncryptedData {
  try {
    // Generate salt
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key from password
    const key = deriveKey(password, salt);

    // Encrypt data
    const encrypted = encrypt(data, key);

    // Include salt in result
    return {
      ...encrypted,
      salt: salt.toString('base64'),
    };
  } catch (error) {
    logger.error('Password encryption failed', { error });
    throw new Error('Failed to encrypt data with password');
  }
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(encryptedData: EncryptedData, key: Buffer | string): string {
  try {
    // Convert key to Buffer if string
    const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key;

    if (keyBuffer.length !== KEY_LENGTH) {
      throw new Error(`Key must be ${KEY_LENGTH} bytes`);
    }

    // Convert base64 strings to Buffers
    const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);

    // Decrypt data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Decryption failed', { error });
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Decrypt data with password
 */
export function decryptWithPassword(
  encryptedData: EncryptedData,
  password: string
): string {
  try {
    if (!encryptedData.salt) {
      throw new Error('Salt is required for password decryption');
    }

    // Convert salt from base64
    const salt = Buffer.from(encryptedData.salt, 'base64');

    // Derive key from password
    const key = deriveKey(password, salt);

    // Decrypt data
    return decrypt(encryptedData, key);
  } catch (error) {
    logger.error('Password decryption failed', { error });
    throw new Error('Failed to decrypt data with password');
  }
}

/**
 * Generate encryption key
 */
export function generateEncryptionKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Hash data using specified algorithm
 */
export function hash(
  data: string,
  options: HashOptions = {}
): string {
  const {
    algorithm = 'sha256',
    encoding = 'hex',
    salt,
  } = options;

  const input = salt ? `${data}${salt}` : data;

  return crypto
    .createHash(algorithm)
    .update(input)
    .digest(encoding);
}

/**
 * Hash password using bcrypt-style algorithm (PBKDF2)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = deriveKey(password, salt);

  // Combine salt and hash
  const combined = Buffer.concat([salt, hash]);

  return combined.toString('base64');
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    // Decode combined salt and hash
    const combined = Buffer.from(hashedPassword, 'base64');

    // Extract salt and hash
    const salt = combined.slice(0, SALT_LENGTH);
    const storedHash = combined.slice(SALT_LENGTH);

    // Derive key from password with same salt
    const derivedHash = deriveKey(password, salt);

    // Constant-time comparison
    return crypto.timingSafeEqual(storedHash, derivedHash);
  } catch (error) {
    logger.error('Password verification failed', { error });
    return false;
  }
}

/**
 * Generate HMAC signature
 */
export function createHMAC(
  data: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): string {
  return crypto
    .createHmac(algorithm, secret)
    .update(data)
    .digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(
  data: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): boolean {
  try {
    const expected = createHMAC(data, secret, algorithm);

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch (error) {
    logger.error('HMAC verification failed', { error });
    return false;
  }
}

/**
 * Generate cryptographic fingerprint of data
 */
export function fingerprint(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Mask sensitive data (for logging)
 */
export function maskSensitiveData(
  data: string,
  visibleStart: number = 4,
  visibleEnd: number = 4
): string {
  if (data.length <= visibleStart + visibleEnd) {
    return '*'.repeat(data.length);
  }

  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const maskedLength = data.length - visibleStart - visibleEnd;

  return `${start}${'*'.repeat(maskedLength)}${end}`;
}

/**
 * Generate API key
 */
export function generateAPIKey(prefix: string = 'sk'): string {
  const random = generateToken(32);
  return `${prefix}_${random}`;
}

/**
 * Hash API key for storage
 */
export function hashAPIKey(apiKey: string): string {
  return hash(apiKey, { algorithm: 'sha256' });
}

/**
 * Verify API key against hash
 */
export function verifyAPIKey(apiKey: string, hashedKey: string): boolean {
  const computedHash = hashAPIKey(apiKey);
  return computedHash === hashedKey;
}

/**
 * Encrypt object (converts to JSON first)
 */
export function encryptObject<T>(obj: T, key: Buffer | string): EncryptedData {
  const json = JSON.stringify(obj);
  return encrypt(json, key);
}

/**
 * Decrypt object (parses JSON after decryption)
 */
export function decryptObject<T>(
  encryptedData: EncryptedData,
  key: Buffer | string
): T {
  const json = decrypt(encryptedData, key);
  return JSON.parse(json);
}

/**
 * Create secure random number within range
 */
export function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const threshold = maxValue - (maxValue % range);

  let randomValue: number;
  do {
    const randomBytes = crypto.randomBytes(bytesNeeded);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = randomValue * 256 + randomBytes[i];
    }
  } while (randomValue >= threshold);

  return min + (randomValue % range);
}

/**
 * Generate OTP (One-Time Password)
 */
export function generateOTP(length: number = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += secureRandomInt(0, 9).toString();
  }
  return otp;
}

/**
 * Constant-time string comparison (prevents timing attacks)
 */
export function constantTimeCompare(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    );
  } catch {
    return false;
  }
}

/**
 * Generate nonce (number used once)
 */
export function generateNonce(length: number = 16): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Generate salt for password hashing
 */
export function generateSalt(length: number = SALT_LENGTH): Buffer {
  return crypto.randomBytes(length);
}

/**
 * Key stretching using PBKDF2
 */
export function stretchKey(
  password: string,
  salt: Buffer,
  iterations: number = PBKDF2_ITERATIONS,
  keyLength: number = KEY_LENGTH
): Buffer {
  return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha512');
}

/**
 * Encrypt data for storage (includes version for future upgrades)
 */
export interface StorageEncryptedData extends EncryptedData {
  version: string;
  algorithm: string;
}

/**
 * Encrypt for storage with metadata
 */
export function encryptForStorage(
  data: string,
  key: Buffer | string
): StorageEncryptedData {
  const encrypted = encrypt(data, key);

  return {
    ...encrypted,
    version: '1.0',
    algorithm: ALGORITHM,
  };
}

/**
 * Decrypt storage data (handles versioning)
 */
export function decryptFromStorage(
  data: StorageEncryptedData,
  key: Buffer | string
): string {
  // Handle different versions if needed
  if (data.version === '1.0' && data.algorithm === ALGORITHM) {
    return decrypt(data, key);
  }

  throw new Error(`Unsupported encryption version: ${data.version}`);
}

