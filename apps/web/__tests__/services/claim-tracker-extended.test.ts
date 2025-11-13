/**
 * Extended tests for ClaimTrackerService
 */

import { ClaimTrackerService } from '@/lib/services/claim-tracker.service';
import { MOCK_ADDRESS, MOCK_TX_HASH } from '../helpers';

describe('ClaimTrackerService - Extended', () => {
  const testAddress = MOCK_ADDRESS;

  describe('getStatistics', () => {
    it('should get claim statistics', async () => {
      // Create some claims
      await ClaimTrackerService.addClaim({
        address: testAddress,
        projectId: 'zora',
        projectName: 'Zora',
        status: 'claimed',
      });

      await ClaimTrackerService.addClaim({
        address: testAddress,
        projectId: 'base',
        projectName: 'Base',
        status: 'pending',
      });

      const stats = await ClaimTrackerService.getStatistics(testAddress);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byStatus');
      expect(typeof stats.total).toBe('number');
    });
  });

  describe('getClaims with filters', () => {
    it('should filter claims by status', async () => {
      await ClaimTrackerService.addClaim({
        address: testAddress,
        projectId: 'zora',
        projectName: 'Zora',
        status: 'claimed',
      });

      await ClaimTrackerService.addClaim({
        address: testAddress,
        projectId: 'base',
        projectName: 'Base',
        status: 'pending',
      });

      const claimed = await ClaimTrackerService.getClaims(testAddress, { status: 'claimed' });

      expect(Array.isArray(claimed)).toBe(true);
      claimed.forEach((claim) => {
        expect(claim.status).toBe('claimed');
      });
    });

    it('should filter claims by projectId', async () => {
      await ClaimTrackerService.addClaim({
        address: testAddress,
        projectId: 'zora',
        projectName: 'Zora',
        status: 'claimed',
      });

      const zoraClaims = await ClaimTrackerService.getClaims(testAddress, { projectId: 'zora' });

      expect(Array.isArray(zoraClaims)).toBe(true);
      zoraClaims.forEach((claim) => {
        expect(claim.projectId).toBe('zora');
      });
    });
  });
});

