/**
 * Response validators for testing
 * Provides utilities to validate API responses
 */

import { NextResponse } from 'next/server';

/**
 * Validate API response structure
 */
export function validateApiResponse(response: NextResponse, expectedStatus: number = 200) {
  expect(response.status).toBe(expectedStatus);
  
  const json = response.json();
  expect(json).toHaveProperty('success');
  
  if (json.success) {
    expect(json).toHaveProperty('data');
  } else {
    expect(json).toHaveProperty('error');
  }
  
  return json;
}

/**
 * Validate error response
 */
export function validateErrorResponse(
  response: NextResponse,
  expectedCode: string,
  expectedStatus: number = 400
) {
  expect(response.status).toBe(expectedStatus);
  
  const json = response.json();
  expect(json.success).toBe(false);
  expect(json.error).toHaveProperty('code', expectedCode);
  expect(json.error).toHaveProperty('message');
  
  return json;
}

/**
 * Validate success response
 */
export function validateSuccessResponse(response: NextResponse, expectedStatus: number = 200) {
  expect(response.status).toBe(expectedStatus);
  
  const json = response.json();
  expect(json.success).toBe(true);
  expect(json).toHaveProperty('data');
  
  return json;
}

/**
 * Validate paginated response
 */
export function validatePaginatedResponse(response: NextResponse) {
  const json = validateSuccessResponse(response);
  
  expect(json.data).toHaveProperty('items');
  expect(json.data).toHaveProperty('pagination');
  expect(json.data.pagination).toHaveProperty('page');
  expect(json.data.pagination).toHaveProperty('limit');
  expect(json.data.pagination).toHaveProperty('total');
  
  return json;
}

/**
 * Validate address format
 */
export function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash format
 */
export function validateTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

