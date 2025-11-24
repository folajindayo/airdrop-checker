/**
 * @fileoverview Authentication middleware for API routes
 * @module lib/auth/middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, SessionData, SessionConfig } from './session';
import { logger } from '@/lib/monitoring/logger';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors/api-errors';

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  /**
   * Session configuration
   */
  sessionConfig?: SessionConfig;

  /**
   * Required roles (if any)
   */
  roles?: string[];

  /**
   * Optional authentication (don't throw if not authenticated)
   */
  optional?: boolean;

  /**
   * Custom error messages
   */
  errorMessages?: {
    unauthenticated?: string;
    unauthorized?: string;
  };
}

/**
 * Extended request with session
 */
export interface AuthenticatedRequest extends NextRequest {
  session?: SessionData;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Authentication middleware for Next.js API routes
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get session
      const session = await getSession(options.sessionConfig);

      // Handle unauthenticated request
      if (!session) {
        if (options.optional) {
          return await handler(req as AuthenticatedRequest);
        }

        logger.warn('Unauthenticated request', {
          url: req.url,
          method: req.method,
        });

        throw new UnauthorizedError(
          options.errorMessages?.unauthenticated || 'Authentication required'
        );
      }

      // Check role if required
      if (options.roles && options.roles.length > 0) {
        if (!session.role || !options.roles.includes(session.role)) {
          logger.warn('Unauthorized access attempt', {
            userId: session.userId,
            requiredRoles: options.roles,
            userRole: session.role,
            url: req.url,
          });

          throw new ForbiddenError(
            options.errorMessages?.unauthorized || 'Insufficient permissions'
          );
        }
      }

      // Attach session and user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.session = session;
      authenticatedReq.user = {
        id: session.userId,
        email: session.email,
        role: session.role,
      };

      // Call the handler
      return await handler(authenticatedReq);
    } catch (error) {
      // Re-throw API errors
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        throw error;
      }

      // Log and throw generic error
      logger.error('Authentication middleware error', { error });
      throw new Error('Authentication failed');
    }
  };
}

/**
 * Middleware to require specific role
 */
export function requireRole(
  role: string,
  sessionConfig?: SessionConfig
): (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => (
  req: NextRequest
) => Promise<NextResponse> {
  return (handler) =>
    withAuth(handler, {
      sessionConfig,
      roles: [role],
    });
}

/**
 * Middleware to require any of the specified roles
 */
export function requireAnyRole(
  roles: string[],
  sessionConfig?: SessionConfig
): (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => (
  req: NextRequest
) => Promise<NextResponse> {
  return (handler) =>
    withAuth(handler, {
      sessionConfig,
      roles,
    });
}

/**
 * Middleware for optional authentication
 */
export function optionalAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  sessionConfig?: SessionConfig
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(handler, {
    sessionConfig,
    optional: true,
  });
}

/**
 * Check authentication in middleware
 */
export async function checkAuth(
  req: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{
  authenticated: boolean;
  session?: SessionData;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}> {
  try {
    const session = await getSession(options.sessionConfig);

    if (!session) {
      return { authenticated: false };
    }

    // Check role if required
    if (options.roles && options.roles.length > 0) {
      if (!session.role || !options.roles.includes(session.role)) {
        return { authenticated: false };
      }
    }

    return {
      authenticated: true,
      session,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
      },
    };
  } catch (error) {
    logger.error('Auth check failed', { error });
    return { authenticated: false };
  }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Middleware to require bearer token authentication
 */
export function withBearerToken(
  handler: (req: AuthenticatedRequest, token: string) => Promise<NextResponse>,
  options: {
    optional?: boolean;
    errorMessage?: string;
  } = {}
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    const token = extractBearerToken(req);

    if (!token) {
      if (options.optional) {
        return await handler(req as AuthenticatedRequest, '');
      }

      throw new UnauthorizedError(
        options.errorMessage || 'Bearer token required'
      );
    }

    return await handler(req as AuthenticatedRequest, token);
  };
}

/**
 * Combine multiple middleware functions
 */
export function composeMiddleware(
  ...middlewares: Array<
    (handler: (req: NextRequest) => Promise<NextResponse>) => (
      req: NextRequest
    ) => Promise<NextResponse>
  >
): (handler: (req: NextRequest) => Promise<NextResponse>) => (
  req: NextRequest
) => Promise<NextResponse> {
  return (handler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

