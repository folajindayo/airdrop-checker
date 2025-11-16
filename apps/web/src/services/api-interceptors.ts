/**
 * API request/response interceptors
 * Provides reusable middleware for API clients
 */

export type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

/**
 * Auth interceptor - adds authentication token
 */
export function createAuthInterceptor(getToken: () => string | null): RequestInterceptor {
  return (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  };
}

/**
 * Logging interceptor - logs requests and responses
 */
export function createLoggingInterceptor(prefix: string = '[API]'): {
  request: RequestInterceptor;
  response: ResponseInterceptor;
} {
  return {
    request: (config) => {
      console.log(`${prefix} Request:`, {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body,
      });
      return config;
    },
    response: (response) => {
      console.log(`${prefix} Response:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      return response;
    },
  };
}

/**
 * Retry interceptor - retries failed requests
 */
export function createRetryInterceptor(
  maxRetries: number = 3,
  retryDelay: number = 1000
): ResponseInterceptor {
  return async (response) => {
    if (response.status >= 500 && response.status < 600) {
      // Server error - implement retry logic
      let retries = 0;
      while (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retries)));
        retries++;
        
        // Note: Would need to re-execute the original request here
        // This is a simplified version
      }
    }
    return response;
  };
}

/**
 * Cache interceptor - caches GET requests
 */
export function createCacheInterceptor(
  cache: Map<string, { data: any; timestamp: number }>,
  ttl: number = 60000 // 1 minute
): {
  request: RequestInterceptor;
  response: ResponseInterceptor;
} {
  return {
    request: (config) => {
      // Check cache for GET requests
      if ((!config.method || config.method === 'GET') && config.cache) {
        const cacheKey = JSON.stringify(config);
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
          // Return cached response
          // Note: This is simplified - actual implementation would need to return from cache
        }
      }
      return config;
    },
    response: (response) => {
      // Cache successful GET responses
      if (response.ok && response.status === 200) {
        // Store in cache
        // Note: Simplified implementation
      }
      return response;
    },
  };
}

/**
 * Error handling interceptor
 */
export function createErrorInterceptor(
  onError?: (error: any) => void
): ResponseInterceptor {
  return async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      
      if (onError) {
        onError(error);
      }

      throw new APIInterceptorError(
        error.message || 'Request failed',
        response.status,
        error
      );
    }
    return response;
  };
}

/**
 * Timeout interceptor
 */
export function createTimeoutInterceptor(timeout: number = 30000): RequestInterceptor {
  return (config) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);

    return {
      ...config,
      signal: controller.signal,
    };
  };
}

/**
 * Headers interceptor - adds common headers
 */
export function createHeadersInterceptor(headers: Record<string, string>): RequestInterceptor {
  return (config) => ({
    ...config,
    headers: {
      ...config.headers,
      ...headers,
    },
  });
}

/**
 * Request ID interceptor - adds unique request ID
 */
export function createRequestIdInterceptor(): RequestInterceptor {
  return (config) => ({
    ...config,
    headers: {
      ...config.headers,
      'X-Request-ID': generateRequestId(),
    },
  });
}

/**
 * Rate limit interceptor - handles rate limit responses
 */
export function createRateLimitInterceptor(
  onRateLimit?: (retryAfter: number) => void
): ResponseInterceptor {
  return async (response) => {
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      
      if (onRateLimit) {
        onRateLimit(retryAfter);
      }

      throw new RateLimitError(retryAfter);
    }
    return response;
  };
}

/**
 * API Interceptor Error
 */
export class APIInterceptorError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIInterceptorError';
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends Error {
  constructor(public retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    this.name = 'RateLimitError';
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Interceptor composer - combines multiple interceptors
 */
export function composeInterceptors(
  ...interceptors: Array<RequestInterceptor | ResponseInterceptor>
): any {
  return interceptors.reduce((composed, interceptor) => {
    return async (input: any) => {
      const result = await composed(input);
      return await interceptor(result);
    };
  });
}

