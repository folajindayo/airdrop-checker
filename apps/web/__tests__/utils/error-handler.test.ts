/**
 * Tests for error handler utilities
 */

import {
  AppError,
  ErrorCode,
  handleApiError,
  withErrorHandling,
  validateOrThrow,
} from '@/lib/utils/error-handler';
import { NextRequest } from 'next/server';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create AppError with message and code', () => {
      const error = new AppError('Test error', ErrorCode.VALIDATION_ERROR, 400);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });

    it('should include details', () => {
      const details = { field: 'address' };
      const error = new AppError('Test error', ErrorCode.VALIDATION_ERROR, 400, details);

      expect(error.details).toEqual(details);
    });
  });

  describe('handleApiError', () => {
    it('should handle AppError', () => {
      const error = new AppError('Test error', ErrorCode.VALIDATION_ERROR, 400);
      const response = handleApiError(error);

      expect(response.status).toBe(400);
    });

    it('should handle regular Error', () => {
      const error = new Error('Test error');
      const response = handleApiError(error);

      expect(response.status).toBe(500);
    });

    it('should handle unknown errors', () => {
      const response = handleApiError(null);

      expect(response.status).toBe(500);
    });
  });

  describe('withErrorHandling', () => {
    it('should wrap handler and catch errors', async () => {
      const handler = async () => {
        throw new AppError('Test error', ErrorCode.VALIDATION_ERROR, 400);
      };

      const wrapped = withErrorHandling(handler);
      const request = new NextRequest('http://localhost:3000/test');
      const response = await wrapped(request);

      expect(response.status).toBe(400);
    });

    it('should pass through successful responses', async () => {
      const { NextResponse } = await import('next/server');
      const handler = async () => {
        return NextResponse.json({ success: true }, { status: 200 });
      };

      const wrapped = withErrorHandling(handler);
      const request = new NextRequest('http://localhost:3000/test');
      const response = await wrapped(request);

      expect(response.status).toBe(200);
    });
  });

  describe('validateOrThrow', () => {
    it('should not throw when condition is true', () => {
      expect(() => validateOrThrow(true, 'Error message')).not.toThrow();
    });

    it('should throw AppError when condition is false', () => {
      expect(() => validateOrThrow(false, 'Error message')).toThrow(AppError);
    });

    it('should use custom error code', () => {
      try {
        validateOrThrow(false, 'Error message', ErrorCode.NOT_FOUND);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.NOT_FOUND);
      }
    });
  });
});

