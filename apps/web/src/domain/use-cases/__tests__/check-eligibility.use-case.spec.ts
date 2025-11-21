/**
 * Check Eligibility Use Case Tests
 */

import { CheckEligibilityUseCase } from '../check-eligibility.use-case';

describe('CheckEligibilityUseCase', () => {
  const mockAirdropRepo = {
    findById: jest.fn(),
    findActive: jest.fn(),
    find: jest.fn(),
    findByChainId: jest.fn(),
    findEligibleForWallet: jest.fn(),
    findUpcoming: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    exists: jest.fn(),
    findByContractAddress: jest.fn(),
    bulkCreate: jest.fn(),
    markAsClaimed: jest.fn(),
  };

  const mockWalletRepo = {
    findByAddress: jest.fn(),
    findByENS: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateBalance: jest.fn(),
    updateLastActivity: jest.fn(),
    addTag: jest.fn(),
    removeTag: jest.fn(),
    getEligibilityScore: jest.fn(),
    exists: jest.fn(),
    getStats: jest.fn(),
  };

  let useCase: CheckEligibilityUseCase;

  beforeEach(() => {
    useCase = new CheckEligibilityUseCase(mockAirdropRepo, mockWalletRepo);
    jest.clearAllMocks();
  });

  it('should check eligibility for a wallet', async () => {
    mockWalletRepo.findByAddress.mockResolvedValue({
      address: '0x123',
      chainId: 1,
    });
    mockAirdropRepo.findActive.mockResolvedValue([]);

    const result = await useCase.execute({
      walletAddress: '0x123',
      chainId: 1,
    });

    expect(result).toBeInstanceOf(Array);
    expect(mockWalletRepo.findByAddress).toHaveBeenCalled();
  });

  it('should throw error if wallet not found', async () => {
    mockWalletRepo.findByAddress.mockResolvedValue(null);

    await expect(
      useCase.execute({
        walletAddress: '0x123',
        chainId: 1,
      })
    ).rejects.toThrow('Wallet not found');
  });
});

