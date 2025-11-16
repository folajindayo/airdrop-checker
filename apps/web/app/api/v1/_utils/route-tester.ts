/**
 * API Route Testing Utilities
 * Helper functions for testing API routes
 */

export interface MockRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(options: MockRequest = {}) {
  const url = options.url || 'http://localhost:3000/api/v1/test';
  const method = options.method || 'GET';
  
  const request = {
    method,
    url,
    headers: new Map(Object.entries(options.headers || {})),
    json: async () => options.body || {},
    nextUrl: new URL(url),
  };

  return request as any;
}

/**
 * Create mock response for testing
 */
export function createMockResponse(data?: any, status: number = 200) {
  return {
    status,
    data,
    ok: status >= 200 && status < 300,
    json: async () => data,
    headers: new Map(),
  };
}

/**
 * Test API endpoint
 */
export async function testEndpoint(
  handler: Function,
  request: MockRequest
): Promise<{
  status: number;
  data: any;
  error?: any;
}> {
  try {
    const mockReq = createMockRequest(request);
    const response = await handler(mockReq);
    const data = await response.json();
    
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      status: 500,
      data: null,
      error,
    };
  }
}

/**
 * Assert response status
 */
export function assertStatus(response: any, expectedStatus: number): void {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}`
    );
  }
}

/**
 * Assert response has data
 */
export function assertHasData(response: any, key?: string): void {
  if (!response.data) {
    throw new Error('Response does not have data');
  }
  
  if (key && !response.data[key]) {
    throw new Error(`Response data does not have key: ${key}`);
  }
}

/**
 * Assert response is error
 */
export function assertIsError(response: any): void {
  if (!response.error) {
    throw new Error('Expected error response');
  }
}

/**
 * Mock API dependencies
 */
export class MockDependencies {
  private mocks: Map<string, any> = new Map();

  mock(key: string, implementation: any): void {
    this.mocks.set(key, implementation);
  }

  get(key: string): any {
    return this.mocks.get(key);
  }

  clear(): void {
    this.mocks.clear();
  }
}

/**
 * Create test suite for API route
 */
export function createRouteSuite(routeName: string) {
  const tests: Array<{
    name: string;
    fn: () => Promise<void>;
  }> = [];

  return {
    test: (name: string, fn: () => Promise<void>) => {
      tests.push({ name: `${routeName}: ${name}`, fn });
    },
    
    run: async () => {
      const results: Array<{
        name: string;
        passed: boolean;
        error?: any;
      }> = [];

      for (const test of tests) {
        try {
          await test.fn();
          results.push({ name: test.name, passed: true });
        } catch (error) {
          results.push({ name: test.name, passed: false, error });
        }
      }

      return results;
    },
  };
}

