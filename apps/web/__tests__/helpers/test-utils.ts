/**
 * Test utilities and helpers
 * Provides common testing functions and mocks
 */

import { NextRequest } from 'next/server';

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  }
): NextRequest {
  const { method = 'GET', body, headers = {}, searchParams = {} } = options || {};

  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(urlObj.toString(), requestInit);
}

/**
 * Create a mock NextRequest with JSON body
 */
export function createMockRequestWithBody(
  url: string,
  body: any,
  options?: {
    method?: string;
    headers?: Record<string, string>;
  }
): NextRequest {
  return createMockRequest(url, {
    ...options,
    method: options?.method || 'POST',
    body,
  });
}

/**
 * Create mock route params
 */
export function createMockParams(params: Record<string, string>) {
  return Promise.resolve(params);
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock Ethereum address
 */
export function createMockAddress(): string {
  return `0x${Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`;
}

/**
 * Create mock transaction hash
 */
export function createMockTxHash(): string {
  return `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`;
}

