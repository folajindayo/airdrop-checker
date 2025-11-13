/**
 * Response handler utilities for API routes
 */

import { NextResponse } from 'next/server';

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json({
    success: true,
    data,
  }, { status });
}

export function createErrorResponse(error: Error, status: number = 500) {
  return NextResponse.json({
    success: false,
    error: {
      message: error.message,
      code: 'INTERNAL_ERROR',
    },
  }, { status });
}

export function createValidationErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: {
      message,
      code: 'VALIDATION_ERROR',
    },
  }, { status });
}

export function createNotFoundResponse(resource: string) {
  return NextResponse.json({
    success: false,
    error: {
      message: `${resource} not found`,
      code: 'NOT_FOUND',
    },
  }, { status: 404 });
}

export function addCacheHeaders(response: NextResponse, maxAge: number) {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}`);
  return response;
}
