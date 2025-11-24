import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export interface ApiContext {
  user?: {
    id: string;
    address: string;
    role: string;
  };
  startTime: number;
}

/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user info to request
 */
export async function authMiddleware(req: NextRequest): Promise<ApiContext | NextResponse> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  return {
    user: {
      id: token.sub as string,
      address: token.address as string,
      role: token.role as string || 'user',
    },
    startTime: Date.now(),
  };
}

/**
 * Rate limiting middleware
 * Implements token bucket algorithm for API rate limiting
 */
const rateLimitStore = new Map<string, { tokens: number; lastRefill: number }>();

export async function rateLimitMiddleware(
  req: NextRequest,
  maxTokens: number = 100,
  refillRate: number = 10
): Promise<NextResponse | null> {
  const identifier = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  const now = Date.now();
  
  let bucket = rateLimitStore.get(identifier);
  
  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    rateLimitStore.set(identifier, bucket);
  }
  
  // Refill tokens
  const timePassed = (now - bucket.lastRefill) / 1000; // seconds
  const tokensToAdd = Math.floor(timePassed * refillRate);
  bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;
  
  if (bucket.tokens < 1) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded', 
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((1 - bucket.tokens) / refillRate)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': maxTokens.toString(),
          'X-RateLimit-Remaining': '0',
          'Retry-After': Math.ceil((1 - bucket.tokens) / refillRate).toString(),
        }
      }
    );
  }
  
  bucket.tokens -= 1;
  return null;
}

/**
 * CORS middleware
 * Adds appropriate CORS headers
 */
export function corsMiddleware(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  
  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    res.headers.set('Access-Control-Allow-Origin', origin || '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.headers.set('Access-Control-Max-Age', '86400');
  }
  
  return res;
}

/**
 * Logging middleware
 * Logs API requests and responses
 */
export function loggingMiddleware(
  req: NextRequest,
  context: ApiContext
): void {
  const duration = Date.now() - context.startTime;
  
  console.log({
    method: req.method,
    url: req.url,
    userId: context.user?.id,
    duration,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validation middleware
 * Validates request parameters and body
 */
export function validateRequest(
  req: NextRequest,
  schema: {
    params?: Record<string, 'string' | 'number' | 'boolean'>;
    query?: Record<string, 'string' | 'number' | 'boolean'>;
    body?: Record<string, any>;
  }
): NextResponse | null {
  // Validate URL parameters
  if (schema.params) {
    // Implementation depends on how you extract params
    // This is a placeholder
  }
  
  // Validate query parameters
  if (schema.query) {
    const url = new URL(req.url);
    for (const [key, type] of Object.entries(schema.query)) {
      const value = url.searchParams.get(key);
      if (value && typeof value !== type) {
        return NextResponse.json(
          { error: 'Validation error', message: `Invalid ${key}: expected ${type}` },
          { status: 400 }
        );
      }
    }
  }
  
  return null;
}

/**
 * Error handling middleware
 * Wraps route handlers with error handling
 */
export function withErrorHandling<T>(
  handler: (req: NextRequest, context?: ApiContext) => Promise<T>
) {
  return async (req: NextRequest, context?: ApiContext): Promise<NextResponse> => {
    try {
      const result = await handler(req, context);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error('API Error:', error);
      
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';
      
      return NextResponse.json(
        { 
          error: error.name || 'APIError',
          message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        },
        { status: statusCode }
      );
    }
  };
}

/**
 * Compose multiple middlewares
 */
export function composeMiddleware(
  ...middlewares: Array<(req: NextRequest, context?: ApiContext) => Promise<NextResponse | ApiContext | null>>
) {
  return async (req: NextRequest): Promise<[NextResponse | null, ApiContext?]> => {
    let context: ApiContext = { startTime: Date.now() };
    
    for (const middleware of middlewares) {
      const result = await middleware(req, context);
      
      if (result instanceof NextResponse) {
        return [result, undefined];
      }
      
      if (result && typeof result === 'object' && 'startTime' in result) {
        context = { ...context, ...result };
      }
    }
    
    return [null, context];
  };
}

