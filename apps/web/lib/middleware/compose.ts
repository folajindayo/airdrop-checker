/**
 * Middleware Composition Utilities
 * 
 * Functions to compose multiple middleware together
 */

import { NextRequest, NextResponse } from 'next/server';

export type Middleware = (
  req: NextRequest,
  res: NextResponse,
  next: () => void | Promise<void>
) => void | Promise<void | NextResponse>;

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(...middlewares: Middleware[]) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let response: NextResponse | undefined;
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= middlewares.length) return;

      const middleware = middlewares[index++];
      const result = await middleware(req, response as any, next);

      if (result instanceof NextResponse) {
        response = result;
      }
    };

    await next();

    return response || NextResponse.next();
  };
}

/**
 * Create middleware chain
 */
export function createMiddlewareChain(middlewares: Middleware[]) {
  return composeMiddleware(...middlewares);
}

/**
 * Conditional middleware wrapper
 */
export function conditionalMiddleware(
  condition: (req: NextRequest) => boolean,
  middleware: Middleware
): Middleware {
  return async (req, res, next) => {
    if (condition(req)) {
      return await middleware(req, res, next);
    }
    return next();
  };
}

/**
 * Error handling middleware wrapper
 */
export function withErrorHandler(middleware: Middleware): Middleware {
  return async (req, res, next) => {
    try {
      return await middleware(req, res, next);
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MIDDLEWARE_ERROR',
            message: 'An error occurred processing the request',
          },
        },
        { status: 500 }
      );
    }
  };
}

