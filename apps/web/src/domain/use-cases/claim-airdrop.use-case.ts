/**
 * Claim Airdrop Use Case
 * Handles the airdrop claiming process
 */

import { IAirdropRepository } from '../repositories/airdrop.repository';
import { IWalletRepository } from '../repositories/wallet.repository';

export interface ClaimAirdropRequest {
  airdropId: string;
  walletAddress: string;
  chainId: number;
  signature?: string;
}

export interface ClaimAirdropResponse {
  success: boolean;
  transactionHash?: string;
  amount: string;
  message: string;
}

export class ClaimAirdropUseCase {
  constructor(
    private readonly airdropRepository: IAirdropRepository,
    private readonly walletRepository: IWalletRepository
  ) {}

  async execute(request: ClaimAirdropRequest): Promise<ClaimAirdropResponse> {
    // Validate airdrop exists
    const airdrop = await this.airdropRepository.findById(request.airdropId);
    
    if (!airdrop) {
      throw new Error('Airdrop not found');
    }

    // Validate wallet
    const wallet = await this.walletRepository.findByAddress(
      request.walletAddress,
      request.chainId
    );

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check if can claim
    if (!airdrop.canClaim()) {
      throw new Error('Airdrop cannot be claimed at this time');
    }

    // Check if already claimed
    if (airdrop.isClaimed()) {
      throw new Error('Airdrop already claimed');
    }

    // Verify eligibility
    if (!airdrop.meetsEligibilityCriteria()) {
      throw new Error('Wallet does not meet eligibility criteria');
    }

    // Process claim (would integrate with smart contract)
    const claimedAirdrop = airdrop.markAsClaimed();
    await this.airdropRepository.update(request.airdropId, claimedAirdrop);
    
    // Mark as claimed for wallet
    await this.airdropRepository.markAsClaimed(request.airdropId, request.walletAddress);

    return {
      success: true,
      amount: airdrop.claimAmount.toString(),
      message: 'Airdrop claimed successfully',
    };
  }
}

