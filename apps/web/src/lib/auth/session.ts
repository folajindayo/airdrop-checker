/**
 * @fileoverview Session management utilities with secure session handling
 * @module lib/auth/session
 */

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { logger } from '@/lib/monitoring/logger';
import { generateRandomString } from '@/lib/utils/crypto';

/**
 * Session data structure
 */
export interface SessionData {
  /**
   * User ID
   */
  userId: string;

  /**
   * User email
   */
  email?: string;

  /**
   * User role
   */
  role?: string;

  /**
   * Additional session metadata
   */
  metadata?: Record<string, unknown>;

  /**
   * Session creation timestamp
   */
  createdAt: number;

  /**
   * Session last active timestamp
   */
  lastActiveAt: number;

  /**
   * Session expiry timestamp
   */
  expiresAt: number;
}

/**
 * Session configuration
 */
export interface SessionConfig {
  /**
   * Session duration in seconds
   */
  maxAge?: number;

  /**
   * Cookie name
   */
  cookieName?: string;

  /**
   * Cookie domain
   */
  domain?: string;

  /**
   * Cookie path
   */
  path?: string;

  /**
   * Cookie secure flag (HTTPS only)
   */
  secure?: boolean;

  /**
   * Cookie httpOnly flag
   */
  httpOnly?: boolean;

  /**
   * Cookie sameSite attribute
   */
  sameSite?: 'strict' | 'lax' | 'none';
}

// Default configuration
const DEFAULT_CONFIG: Required<SessionConfig> = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  cookieName: 'session',
  domain: '',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax',
};

/**
 * Get JWT secret key
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET or JWT_SECRET environment variable is required');
  }

  return new TextEncoder().encode(secret);
}

/**
 * Create a new session
 */
export async function createSession(
  data: Omit<SessionData, 'createdAt' | 'lastActiveAt' | 'expiresAt'>,
  config: SessionConfig = {}
): Promise<string> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();

  const sessionData: SessionData = {
    ...data,
    createdAt: now,
    lastActiveAt: now,
    expiresAt: now + cfg.maxAge * 1000,
  };

  try {
    const token = await new SignJWT(sessionData as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now / 1000)
      .setExpirationTime(sessionData.expiresAt / 1000)
      .setJti(generateRandomString(32))
      .sign(getSecretKey());

    logger.debug('Session created', { userId: data.userId });

    return token;
  } catch (error) {
    logger.error('Failed to create session', { error, userId: data.userId });
    throw new Error('Failed to create session');
  }
}

/**
 * Verify and decode a session token
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    const sessionData = payload as unknown as SessionData;

    // Check if session is expired
    if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
      logger.warn('Session expired', { userId: sessionData.userId });
      return null;
    }

    return sessionData;
  } catch (error) {
    logger.warn('Invalid session token', { error });
    return null;
  }
}

/**
 * Get session from cookies
 */
export async function getSession(
  config: SessionConfig = {}
): Promise<SessionData | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    const cookieStore = cookies();
    const token = cookieStore.get(cfg.cookieName)?.value;

    if (!token) {
      return null;
    }

    return await verifySession(token);
  } catch (error) {
    logger.error('Failed to get session', { error });
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(
  token: string,
  config: SessionConfig = {}
): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    const cookieStore = cookies();

    cookieStore.set({
      name: cfg.cookieName,
      value: token,
      maxAge: cfg.maxAge,
      domain: cfg.domain || undefined,
      path: cfg.path,
      secure: cfg.secure,
      httpOnly: cfg.httpOnly,
      sameSite: cfg.sameSite,
    });

    logger.debug('Session cookie set');
  } catch (error) {
    logger.error('Failed to set session cookie', { error });
    throw new Error('Failed to set session cookie');
  }
}

/**
 * Create and set session
 */
export async function createAndSetSession(
  data: Omit<SessionData, 'createdAt' | 'lastActiveAt' | 'expiresAt'>,
  config: SessionConfig = {}
): Promise<string> {
  const token = await createSession(data, config);
  await setSessionCookie(token, config);
  return token;
}

/**
 * Clear session cookie
 */
export async function clearSession(config: SessionConfig = {}): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    const cookieStore = cookies();

    cookieStore.set({
      name: cfg.cookieName,
      value: '',
      maxAge: 0,
      domain: cfg.domain || undefined,
      path: cfg.path,
      secure: cfg.secure,
      httpOnly: cfg.httpOnly,
      sameSite: cfg.sameSite,
    });

    logger.debug('Session cleared');
  } catch (error) {
    logger.error('Failed to clear session', { error });
    throw new Error('Failed to clear session');
  }
}

/**
 * Refresh session expiry
 */
export async function refreshSession(
  config: SessionConfig = {}
): Promise<SessionData | null> {
  const session = await getSession(config);

  if (!session) {
    return null;
  }

  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();

  const updatedSession: SessionData = {
    ...session,
    lastActiveAt: now,
    expiresAt: now + cfg.maxAge * 1000,
  };

  try {
    const token = await new SignJWT(updatedSession as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now / 1000)
      .setExpirationTime(updatedSession.expiresAt / 1000)
      .setJti(generateRandomString(32))
      .sign(getSecretKey());

    await setSessionCookie(token, config);

    logger.debug('Session refreshed', { userId: session.userId });

    return updatedSession;
  } catch (error) {
    logger.error('Failed to refresh session', { error, userId: session.userId });
    return null;
  }
}

/**
 * Validate session and refresh if needed
 */
export async function validateAndRefreshSession(
  config: SessionConfig = {}
): Promise<SessionData | null> {
  const session = await getSession(config);

  if (!session) {
    return null;
  }

  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const timeUntilExpiry = session.expiresAt - now;
  const refreshThreshold = cfg.maxAge * 1000 * 0.5; // Refresh if less than 50% time remaining

  if (timeUntilExpiry < refreshThreshold) {
    return await refreshSession(config);
  }

  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(config: SessionConfig = {}): Promise<boolean> {
  const session = await getSession(config);
  return session !== null;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(
  config: SessionConfig = {}
): Promise<SessionData> {
  const session = await getSession(config);

  if (!session) {
    throw new Error('Authentication required');
  }

  return session;
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  role: string,
  config: SessionConfig = {}
): Promise<boolean> {
  const session = await getSession(config);

  if (!session) {
    return false;
  }

  return session.role === role;
}

/**
 * Require specific role (throws if not authorized)
 */
export async function requireRole(
  role: string,
  config: SessionConfig = {}
): Promise<SessionData> {
  const session = await requireAuth(config);

  if (session.role !== role) {
    throw new Error('Insufficient permissions');
  }

  return session;
}

