/**
 * Tests for response handler utilities
 */

import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundResponse,
  addCacheHeaders,
} from '@/lib/utils/response-handlers';
import { NextResponse } from 'next/server';

describe('Response Handlers', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { message: 'Success' };
      const response = createSuccessResponse(data);

      expect(response).toBeInstanceOf(NextResponse);
      
      const json = response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
    });

    it('should use default status 200', () => {
      const response = createSuccessResponse({});
      expect(response.status).toBe(200);
    });

    it('should allow custom status code', () => {
      const response = createSuccessResponse({}, { status: 201 });
      expect(response.status).toBe(201);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response from Error object', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error);

      expect(response).toBeInstanceOf(NextResponse);
      
      const json = response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
      expect(json.error.message).toBe('Test error');
    });

    it('should use default status 500', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error);
      expect(response.status).toBe(500);
    });

    it('should allow custom status code', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error, 400);
      expect(response.status).toBe(400);
    });
  });

  describe('createValidationErrorResponse', () => {
    it('should create validation error response', () => {
      const response = createValidationErrorResponse('Invalid input');

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
      
      const json = response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.message).toBe('Invalid input');
    });
  });

  describe('createNotFoundResponse', () => {
    it('should create not found response', () => {
      const response = createNotFoundResponse('Resource');

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      const json = response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
      expect(json.error.message).toContain('Resource');
    });
  });

  describe('addCacheHeaders', () => {
    it('should add cache headers to response', () => {
      const response = createSuccessResponse({});
      const cachedResponse = addCacheHeaders(response, 3600);

      expect(cachedResponse.headers.get('Cache-Control')).toBe('public, max-age=3600');
    });

    it('should preserve response data', () => {
      const data = { test: 'data' };
      const response = createSuccessResponse(data);
      const cachedResponse = addCacheHeaders(response, 3600);

      const json = cachedResponse.json();
      expect(json.data).toEqual(data);
    });
  });
});

