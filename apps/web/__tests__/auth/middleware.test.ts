/**
 * @fileoverview Tests for authentication middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withAuth,
  requireAuth,
  requireRole,
  requirePermission,
  optionalAuth,
} from '@/lib/auth/middleware';
import { createSession } from '@/lib/auth/session';

// Mock session module
jest.mock('@/lib/auth/session', () => ({
  verifySession: jest.fn(),
  createSession: jest.fn(),
}));

describe('Authentication Middleware', () => {
  let mockRequest: NextRequest;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      url: 'http://localhost:3000/api/test',
      method: 'GET',
      headers: new Headers(),
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    mockHandler = jest.fn(async () =>
      NextResponse.json({ success: true })
    );

    jest.clearAllMocks();
  });

  describe('withAuth', () => {
    it('should allow authenticated requests', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
      });

      mockRequest.headers.set('Authorization', 'Bearer valid-token');

      const middleware = withAuth(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should reject unauthenticated requests', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue(null);

      const middleware = withAuth(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });

    it('should extract token from Authorization header', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({ userId: 'user-123' });

      mockRequest.headers.set('Authorization', 'Bearer test-token');

      const middleware = withAuth(mockHandler);
      await middleware(mockRequest);

      expect(verifySession).toHaveBeenCalledWith('test-token');
    });

    it('should extract token from cookie', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({ userId: 'user-123' });

      mockRequest.cookies.get = jest.fn().mockReturnValue({
        value: 'cookie-token',
      });

      const middleware = withAuth(mockHandler);
      await middleware(mockRequest);

      expect(verifySession).toHaveBeenCalled();
    });

    it('should handle verification errors', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockRejectedValue(new Error('Invalid token'));

      mockRequest.headers.set('Authorization', 'Bearer invalid-token');

      const middleware = withAuth(mockHandler);
      const response = await middleware(mockRequest);

      expect(response.status).toBe(401);
    });
  });

  describe('requireAuth', () => {
    it('should pass user data to handler', async () => {
      const { verifySession } = require('@/lib/auth/session');
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };
      verifySession.mockResolvedValue(userData);

      mockRequest.headers.set('Authorization', 'Bearer valid-token');

      const middleware = requireAuth(mockHandler);
      await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: userData,
        })
      );
    });

    it('should reject requests without token', async () => {
      const middleware = requireAuth(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });
  });

  describe('requireRole', () => {
    it('should allow users with correct role', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'admin-123',
        role: 'admin',
      });

      mockRequest.headers.set('Authorization', 'Bearer admin-token');

      const middleware = requireRole('admin')(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should reject users with incorrect role', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'user-123',
        role: 'user',
      });

      mockRequest.headers.set('Authorization', 'Bearer user-token');

      const middleware = requireRole('admin')(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
    });

    it('should accept multiple roles', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'user-123',
        role: 'moderator',
      });

      mockRequest.headers.set('Authorization', 'Bearer mod-token');

      const middleware = requireRole(['admin', 'moderator'])(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('requirePermission', () => {
    it('should allow users with permission', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'user-123',
        permissions: ['read:data', 'write:data'],
      });

      mockRequest.headers.set('Authorization', 'Bearer valid-token');

      const middleware = requirePermission('read:data')(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should reject users without permission', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'user-123',
        permissions: ['read:data'],
      });

      mockRequest.headers.set('Authorization', 'Bearer valid-token');

      const middleware = requirePermission('delete:data')(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
    });

    it('should require all permissions', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'user-123',
        permissions: ['read:data', 'write:data'],
      });

      mockRequest.headers.set('Authorization', 'Bearer valid-token');

      const middleware = requirePermission(['read:data', 'write:data'])(
        mockHandler
      );
      const response = await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('optionalAuth', () => {
    it('should pass user data if authenticated', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
      });

      mockRequest.headers.set('Authorization', 'Bearer valid-token');

      const middleware = optionalAuth(mockHandler);
      await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.any(Object),
        })
      );
    });

    it('should pass null user if unauthenticated', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue(null);

      const middleware = optionalAuth(mockHandler);
      await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: null,
        })
      );
    });

    it('should not block unauthenticated requests', async () => {
      const middleware = optionalAuth(mockHandler);
      const response = await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('Error Responses', () => {
    it('should return proper error structure', async () => {
      const middleware = requireAuth(mockHandler);
      const response = await middleware(mockRequest);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('message');
      expect(data.error).toHaveProperty('code');
    });

    it('should include request ID in errors', async () => {
      const middleware = requireAuth(mockHandler);
      const response = await middleware(mockRequest);

      const data = await response.json();
      expect(data.error).toHaveProperty('requestId');
    });
  });

  describe('Integration', () => {
    it('should chain multiple middleware', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'admin-123',
        role: 'admin',
        permissions: ['read:data'],
      });

      mockRequest.headers.set('Authorization', 'Bearer admin-token');

      const middleware = requireRole('admin')(
        requirePermission('read:data')(mockHandler)
      );

      const response = await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should fail at first middleware failure', async () => {
      const { verifySession } = require('@/lib/auth/session');
      verifySession.mockResolvedValue({
        userId: 'user-123',
        role: 'user',
        permissions: ['read:data'],
      });

      mockRequest.headers.set('Authorization', 'Bearer user-token');

      const middleware = requireRole('admin')(
        requirePermission('read:data')(mockHandler)
      );

      const response = await middleware(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
    });
  });
});

