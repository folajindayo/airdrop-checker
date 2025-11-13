/**
 * Tests for /api/reminders route
 */

import { POST, GET, PATCH, DELETE } from '@/app/api/reminders/route';
import { NextRequest } from 'next/server';
import {
  createMockRequest,
  createMockRequestWithBody,
  createQueryRequest,
  MOCK_ADDRESS,
  MOCK_REMINDER,
} from '../helpers';

describe('/api/reminders', () => {
  describe('POST', () => {
    it('should create a reminder successfully', async () => {
      const request = createMockRequestWithBody('/api/reminders', {
        address: MOCK_ADDRESS,
        type: 'claim',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.reminder).toBeDefined();
      expect(json.data.reminder.address).toBe(MOCK_ADDRESS.toLowerCase());
      expect(json.data.reminder.type).toBe('claim');
    });

    it('should return validation error for missing address', async () => {
      const request = createMockRequestWithBody('/api/reminders', {
        type: 'claim',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid address', async () => {
      const request = createMockRequestWithBody('/api/reminders', {
        address: 'invalid-address',
        type: 'claim',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for past reminder time', async () => {
      const request = createMockRequestWithBody('/api/reminders', {
        address: MOCK_ADDRESS,
        type: 'claim',
        reminderTime: new Date(Date.now() - 86400000).toISOString(),
        message: 'Test reminder',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid type', async () => {
      const request = createMockRequestWithBody('/api/reminders', {
        address: MOCK_ADDRESS,
        type: 'invalid-type',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET', () => {
    it('should get reminders for address', async () => {
      const request = createQueryRequest('/api/reminders', {
        address: MOCK_ADDRESS,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.reminders).toBeDefined();
      expect(Array.isArray(json.data.reminders)).toBe(true);
      expect(json.data.stats).toBeDefined();
    });

    it('should return validation error for missing address', async () => {
      const request = createQueryRequest('/api/reminders', {});

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should filter reminders by type', async () => {
      const request = createQueryRequest('/api/reminders', {
        address: MOCK_ADDRESS,
        type: 'claim',
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should filter upcoming reminders', async () => {
      const request = createQueryRequest('/api/reminders', {
        address: MOCK_ADDRESS,
        upcoming: 'true',
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe('PATCH', () => {
    it('should update a reminder successfully', async () => {
      // First create a reminder
      const createRequest = createMockRequestWithBody('/api/reminders', {
        address: MOCK_ADDRESS,
        type: 'claim',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder',
      });

      const createResponse = await POST(createRequest);
      const createJson = await createResponse.json();
      const reminderId = createJson.data.reminder.id;

      // Then update it
      const updateRequest = createMockRequestWithBody('/api/reminders', {
        id: reminderId,
        enabled: false,
      });

      const updateResponse = await PATCH(updateRequest);
      const updateJson = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateJson.success).toBe(true);
      expect(updateJson.data.reminder.enabled).toBe(false);
    });

    it('should return validation error for missing id', async () => {
      const request = createMockRequestWithBody('/api/reminders', {
        enabled: false,
      });

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return not found for non-existent reminder', async () => {
      const request = createMockRequestWithBody('/api/reminders', {
        id: 'non-existent-id',
        enabled: false,
      });

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE', () => {
    it('should delete a reminder successfully', async () => {
      // First create a reminder
      const createRequest = createMockRequestWithBody('/api/reminders', {
        address: MOCK_ADDRESS,
        type: 'claim',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder',
      });

      const createResponse = await POST(createRequest);
      const createJson = await createResponse.json();
      const reminderId = createJson.data.reminder.id;

      // Then delete it
      const deleteRequest = createQueryRequest('/api/reminders', {
        id: reminderId,
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteJson = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteJson.success).toBe(true);
    });

    it('should return validation error for missing id', async () => {
      const request = createQueryRequest('/api/reminders', {});

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return not found for non-existent reminder', async () => {
      const request = createQueryRequest('/api/reminders', {
        id: 'non-existent-id',
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });
});

