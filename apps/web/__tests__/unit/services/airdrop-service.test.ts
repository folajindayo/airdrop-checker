/**
 * Airdrop Service Tests
 */

import { AirdropService } from '../../../src/services/airdrop-service';

describe('AirdropService', () => {
  let service: AirdropService;

  beforeEach(() => {
    service = new AirdropService();
  });

  describe('getAirdrops', () => {
    it('should return airdrops list', async () => {
      const result = await service.getAirdrops();
      expect(result).toHaveProperty('airdrops');
      expect(result).toHaveProperty('total');
    });

    it('should filter by status', async () => {
      const result = await service.getAirdrops({ status: 'active' });
      expect(result.airdrops).toBeInstanceOf(Array);
    });
  });

  describe('checkEligibility', () => {
    it('should check eligibility for an airdrop', async () => {
      const result = await service.checkEligibility('0x' + '0'.repeat(40), 'test-airdrop');
      expect(result).toBeTruthy();
    });
  });
});

