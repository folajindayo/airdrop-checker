/**
 * Tests for ClaimTrackerService
 */

import { ClaimTrackerService } from '@/lib/services';

describe('ClaimTrackerService', () => {
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('addClaim', () => {
    it('should create a new claim', async () => {
      const claim = await ClaimTrackerService.addClaim({
        address: testAddress,
        projectId: 'test-1',
        projectName: 'Test Project',
        status: 'claimed',
        amount: '100',
        valueUSD: 1000,
      });

      expect(claim.id).toBeDefined();
      expect(claim.address).toBe(testAddress.toLowerCase());
      expect(claim.projectName).toBe('Test Project');
    });
  });

  describe('getClaims', () => {
    it('should return claims for address', async () => {
      await ClaimTrackerService.addClaim({
        address: testAddress,
        projectId: 'test-2',
        projectName: 'Test 2',
        status: 'pending',
      });

      const claims = await ClaimTrackerService.getClaims(testAddress);
      expect(claims.length).toBeGreaterThan(0);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const stats = await ClaimTrackerService.getStatistics(testAddress);
      expect(stats).toHaveProperty('totalClaims');
      expect(stats).toHaveProperty('claimedCount');
      expect(typeof stats.totalValueUSD).toBe('number');
    });
  });
});


