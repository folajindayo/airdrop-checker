/**
 * Tests for /api/claim-tracker route
 */

import { POST, GET, PATCH, DELETE } from '@/app/api/claim-tracker/route';
import {
  createMockRequestWithBody,
  createQueryRequest,
  MOCK_ADDRESS,
  MOCK_TX_HASH,
} from '../helpers';

describe('/api/claim-tracker', () => {
  describe('POST', () => {
    it('should add a claim entry successfully', async () => {
      const request = createMockRequestWithBody('/api/claim-tracker', {
        address: MOCK_ADDRESS,
        projectId: 'zora',
        projectName: 'Zora',
        status: 'claimed',
        amount: '1000',
        valueUSD: 1000,
        txHash: MOCK_TX_HASH,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.claim).toBeDefined();
      expect(json.data.claim.address).toBe(MOCK_ADDRESS.toLowerCase());
      expect(json.data.claim.status).toBe('claimed');
    });

    it('should return validation error for missing required fields', async () => {
      const request = createMockRequestWithBody('/api/claim-tracker', {
        address: MOCK_ADDRESS,
        projectId: 'zora',
        // Missing projectName
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid address', async () => {
      const request = createMockRequestWithBody('/api/claim-tracker', {
        address: 'invalid-address',
        projectId: 'zora',
        projectName: 'Zora',
        status: 'claimed',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid status', async () => {
      const request = createMockRequestWithBody('/api/claim-tracker', {
        address: MOCK_ADDRESS,
        projectId: 'zora',
        projectName: 'Zora',
        status: 'invalid-status',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET', () => {
    it('should get claims for address', async () => {
      const request = createQueryRequest('/api/claim-tracker', {
        address: MOCK_ADDRESS,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.claims).toBeDefined();
      expect(Array.isArray(json.data.claims)).toBe(true);
      expect(json.data.stats).toBeDefined();
    });

    it('should return validation error for missing address', async () => {
      const request = createQueryRequest('/api/claim-tracker', {});

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should filter claims by status', async () => {
      const request = createQueryRequest('/api/claim-tracker', {
        address: MOCK_ADDRESS,
        status: 'claimed',
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should filter claims by projectId', async () => {
      const request = createQueryRequest('/api/claim-tracker', {
        address: MOCK_ADDRESS,
        projectId: 'zora',
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe('PATCH', () => {
    it('should update a claim successfully', async () => {
      // First create a claim
      const createRequest = createMockRequestWithBody('/api/claim-tracker', {
        address: MOCK_ADDRESS,
        projectId: 'zora',
        projectName: 'Zora',
        status: 'pending',
      });

      const createResponse = await POST(createRequest);
      const createJson = await createResponse.json();
      const claimId = createJson.data.claim.id;

      // Then update it
      const updateRequest = createMockRequestWithBody('/api/claim-tracker', {
        id: claimId,
        address: MOCK_ADDRESS,
        status: 'claimed',
        txHash: MOCK_TX_HASH,
      });

      const updateResponse = await PATCH(updateRequest);
      const updateJson = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateJson.success).toBe(true);
      expect(updateJson.data.claim.status).toBe('claimed');
    });

    it('should return validation error for missing id', async () => {
      const request = createMockRequestWithBody('/api/claim-tracker', {
        address: MOCK_ADDRESS,
        status: 'claimed',
      });

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return not found for non-existent claim', async () => {
      const request = createMockRequestWithBody('/api/claim-tracker', {
        id: 'non-existent-id',
        address: MOCK_ADDRESS,
        status: 'claimed',
      });

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE', () => {
    it('should delete a claim successfully', async () => {
      // First create a claim
      const createRequest = createMockRequestWithBody('/api/claim-tracker', {
        address: MOCK_ADDRESS,
        projectId: 'zora',
        projectName: 'Zora',
        status: 'claimed',
      });

      const createResponse = await POST(createRequest);
      const createJson = await createResponse.json();
      const claimId = createJson.data.claim.id;

      // Then delete it
      const deleteRequest = createQueryRequest('/api/claim-tracker', {
        id: claimId,
        address: MOCK_ADDRESS,
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteJson = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteJson.success).toBe(true);
    });

    it('should return validation error for missing id', async () => {
      const request = createQueryRequest('/api/claim-tracker', {
        address: MOCK_ADDRESS,
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return not found for non-existent claim', async () => {
      const request = createQueryRequest('/api/claim-tracker', {
        id: 'non-existent-id',
        address: MOCK_ADDRESS,
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });
});

