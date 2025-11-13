/**
 * API route testing helpers
 * Provides utilities specifically for testing Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Test API route handler
 */
export async function testApiRoute(
  handler: (request: NextRequest, params?: any) => Promise<NextResponse>,
  request: NextRequest,
  params?: any
): Promise<NextResponse> {
  try {
    return await handler(request, params);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Create test request with address parameter
 */
export function createAddressRequest(address: string, options?: {
  method?: string;
  searchParams?: Record<string, string>;
}): { request: NextRequest; params: Promise<{ address: string }> } {
  const url = `http://localhost:3000/api/test/${address}`;
  const request = new NextRequest(url, {
    method: options?.method || 'GET',
  });

  if (options?.searchParams) {
    const urlObj = new URL(url);
    Object.entries(options.searchParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
  }

  const params = Promise.resolve({ address });

  return { request, params };
}

/**
 * Create test request with query parameters
 */
export function createQueryRequest(
  path: string,
  queryParams: Record<string, string>
): NextRequest {
  const url = new URL(`http://localhost:3000${path}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return new NextRequest(url.toString());
}

/**
 * Create test POST request with body
 */
export function createPostRequest(
  path: string,
  body: any,
  headers?: Record<string, string>
): NextRequest {
  const url = `http://localhost:3000${path}`;
  
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Extract JSON from response
 */
export async function getResponseJson(response: NextResponse): Promise<any> {
  const text = await response.text();
  return JSON.parse(text);
}

/**
 * Assert response status
 */
export function assertStatus(response: NextResponse, expectedStatus: number): void {
  expect(response.status).toBe(expectedStatus);
}

/**
 * Assert response has success property
 */
export async function assertSuccess(response: NextResponse): Promise<void> {
  const json = await getResponseJson(response);
  expect(json.success).toBe(true);
}

/**
 * Assert response has error property
 */
export async function assertError(response: NextResponse, expectedCode?: string): Promise<void> {
  const json = await getResponseJson(response);
  expect(json.success).toBe(false);
  expect(json.error).toBeDefined();
  
  if (expectedCode) {
    expect(json.error.code).toBe(expectedCode);
  }
}

