/**
 * Airdrop Entity Tests
 */

import { AirdropEntity, AirdropStatus } from '../airdrop.entity';

describe('AirdropEntity', () => {
  const validProps = {
    id: 'airdrop-1',
    name: 'Test Airdrop',
    symbol: 'TEST',
    totalAmount: 1000000n,
    claimAmount: 100000n,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    chainId: 1,
    contractAddress: '0x' + '1'.repeat(40),
    status: AirdropStatus.ACTIVE,
    eligibilityCriteria: [],
  };

  describe('create', () => {
    it('should create a valid airdrop entity', () => {
      const airdrop = AirdropEntity.create(validProps);
      expect(airdrop.id).toBe(validProps.id);
      expect(airdrop.name).toBe(validProps.name);
    });

    it('should throw error for invalid contract address', () => {
      expect(() =>
        AirdropEntity.create({ ...validProps, contractAddress: 'invalid' })
      ).toThrow('Invalid contract address');
    });

    it('should throw error if claim amount exceeds total', () => {
      expect(() =>
        AirdropEntity.create({ ...validProps, claimAmount: 2000000n })
      ).toThrow('Claim amount cannot exceed total amount');
    });
  });

  describe('business logic', () => {
    it('should correctly identify active airdrops', () => {
      const airdrop = AirdropEntity.create(validProps);
      expect(airdrop.isActive()).toBe(true);
    });

    it('should calculate claim percentage correctly', () => {
      const airdrop = AirdropEntity.create(validProps);
      expect(airdrop.getClaimPercentage()).toBe(10);
    });

    it('should mark as claimed', () => {
      const airdrop = AirdropEntity.create(validProps);
      const claimed = airdrop.markAsClaimed();
      expect(claimed.status).toBe(AirdropStatus.CLAIMED);
    });
  });
});


