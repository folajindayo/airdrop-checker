/**
 * @fileoverview Tests for session management
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  createSession,
  verifySession,
  SessionData,
} from '@/lib/auth/session';

// Mock environment variables
process.env.SESSION_SECRET = 'test-secret-key-for-testing-purposes-only';

describe('Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a valid session token', async () => {
      const sessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };

      const token = await createSession(sessionData);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should create different tokens for same data', async () => {
      const sessionData = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token1 = await createSession(sessionData);
      const token2 = await createSession(sessionData);

      expect(token1).not.toBe(token2);
    });

    it('should support custom expiry', async () => {
      const sessionData = {
        userId: 'user-123',
      };

      const token = await createSession(sessionData, {
        maxAge: 3600, // 1 hour
      });

      const verified = await verifySession(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe('user-123');
    });

    it('should include metadata', async () => {
      const sessionData = {
        userId: 'user-123',
        metadata: {
          loginIp: '127.0.0.1',
          userAgent: 'Test Agent',
        },
      };

      const token = await createSession(sessionData);
      const verified = await verifySession(token);

      expect(verified?.metadata).toEqual(sessionData.metadata);
    });
  });

  describe('verifySession', () => {
    it('should verify valid session', async () => {
      const sessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };

      const token = await createSession(sessionData);
      const verified = await verifySession(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(sessionData.userId);
      expect(verified?.email).toBe(sessionData.email);
      expect(verified?.role).toBe(sessionData.role);
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';

      const verified = await verifySession(invalidToken);

      expect(verified).toBeNull();
    });

    it('should reject expired session', async () => {
      const sessionData = {
        userId: 'user-123',
      };

      const token = await createSession(sessionData, {
        maxAge: -1, // Expired
      });

      // Wait a bit to ensure expiry
      await new Promise((resolve) => setTimeout(resolve, 100));

      const verified = await verifySession(token);

      expect(verified).toBeNull();
    });

    it('should include timestamps', async () => {
      const sessionData = {
        userId: 'user-123',
      };

      const token = await createSession(sessionData);
      const verified = await verifySession(token);

      expect(verified).not.toBeNull();
      expect(typeof verified?.createdAt).toBe('number');
      expect(typeof verified?.lastActiveAt).toBe('number');
      expect(typeof verified?.expiresAt).toBe('number');
    });
  });

  describe('Session Lifecycle', () => {
    it('should handle full session lifecycle', async () => {
      // Create session
      const sessionData = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = await createSession(sessionData);

      // Verify session
      const verified = await verifySession(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe('user-123');
    });

    it('should preserve all session fields', async () => {
      const sessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        metadata: {
          ip: '127.0.0.1',
          device: 'desktop',
        },
      };

      const token = await createSession(sessionData);
      const verified = await verifySession(token);

      expect(verified).toMatchObject({
        userId: sessionData.userId,
        email: sessionData.email,
        role: sessionData.role,
        metadata: sessionData.metadata,
      });
    });
  });

  describe('Security', () => {
    it('should not allow token tampering', async () => {
      const token = await createSession({ userId: 'user-123' });

      // Try to tamper with the token
      const parts = token.split('.');
      if (parts.length === 3) {
        parts[1] = 'tampered';
        const tamperedToken = parts.join('.');

        const verified = await verifySession(tamperedToken);
        expect(verified).toBeNull();
      }
    });

    it('should require secret key', async () => {
      const originalSecret = process.env.SESSION_SECRET;
      delete process.env.SESSION_SECRET;
      delete process.env.JWT_SECRET;

      await expect(createSession({ userId: 'test' })).rejects.toThrow();

      process.env.SESSION_SECRET = originalSecret;
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long user IDs', async () => {
      const longUserId = 'a'.repeat(1000);
      const token = await createSession({ userId: longUserId });
      const verified = await verifySession(token);

      expect(verified?.userId).toBe(longUserId);
    });

    it('should handle special characters in data', async () => {
      const sessionData = {
        userId: 'user-123',
        email: 'test+special@example.com',
        metadata: {
          note: '你好世界 🌍 Special <chars>',
        },
      };

      const token = await createSession(sessionData);
      const verified = await verifySession(token);

      expect(verified?.email).toBe(sessionData.email);
      expect(verified?.metadata).toEqual(sessionData.metadata);
    });

    it('should handle empty metadata', async () => {
      const token = await createSession({
        userId: 'user-123',
        metadata: {},
      });

      const verified = await verifySession(token);
      expect(verified?.metadata).toEqual({});
    });

    it('should handle missing optional fields', async () => {
      const token = await createSession({
        userId: 'user-123',
      });

      const verified = await verifySession(token);
      expect(verified?.userId).toBe('user-123');
      expect(verified?.email).toBeUndefined();
      expect(verified?.role).toBeUndefined();
    });
  });

  describe('Token Format', () => {
    it('should generate JWT format tokens', async () => {
      const token = await createSession({ userId: 'user-123' });

      // JWT has 3 parts separated by dots
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should be URL-safe', async () => {
      const token = await createSession({ userId: 'user-123' });

      // Should not contain URL-unsafe characters
      expect(token).not.toMatch(/[+/=]/);
    });
  });
});

