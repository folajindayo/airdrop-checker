/**
 * ClaimAirdropUseCase Tests
 */

import { ClaimAirdropUseCase } from '../claim-airdrop.use-case';

describe('ClaimAirdropUseCase', () => {
  let useCase: ClaimAirdropUseCase;
  let mockAirdropRepo: any;
  let mockWalletRepo: any;

  beforeEach(() => {
    mockAirdropRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockWalletRepo = {
      findByAddress: jest.fn(),
      save: jest.fn(),
    };
    useCase = new ClaimAirdropUseCase(mockAirdropRepo, mockWalletRepo);
  });

  it('should claim airdrop successfully', async () => {
    const mockAirdrop = {
      id: '1',
      status: 'active',
      claim: jest.fn(),
    };
    const mockWallet = {
      address: '0x123',
      addToken: jest.fn(),
    };

    mockAirdropRepo.findById.mockResolvedValue(mockAirdrop);
    mockWalletRepo.findByAddress.mockResolvedValue(mockWallet);

    await useCase.execute({ airdropId: '1', walletAddress: '0x123' });

    expect(mockAirdrop.claim).toHaveBeenCalled();
    expect(mockAirdropRepo.save).toHaveBeenCalled();
  });

  it('should throw error if airdrop not found', async () => {
    mockAirdropRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ airdropId: '1', walletAddress: '0x123' })
    ).rejects.toThrow('Airdrop not found');
  });
});


