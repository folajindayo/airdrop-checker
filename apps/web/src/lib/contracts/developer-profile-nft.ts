/**
 * DeveloperProfileNFT Contract Integration
 * 
 * This module provides utilities for interacting with the DeveloperProfileNFT
 * contract on Base network. Developers can mint achievement badges based on
 * their GitHub activity and Talent Protocol scores.
 */

import { Address, PublicClient, WalletClient } from 'viem';
import { base } from 'viem/chains';
import { DEVELOPER_PROFILE_NFT_ABI, DEVELOPER_PROFILE_NFT_ADDRESS } from '../../../abi';

// Achievement types enum
export enum AchievementType {
  COMMITS_100 = 0,
  COMMITS_1000 = 1,
  REPOS_10 = 2,
  REPOS_50 = 3,
  STARS_100 = 4,
  STARS_1000 = 5,
  CONTRIBUTOR_10 = 6,
  CONTRIBUTOR_50 = 7,
  TALENT_VERIFIED = 8,
  EARLY_ADOPTER = 9,
  BUILDER_SCORE_HIGH = 10,
}

// Achievement data type
export interface Achievement {
  achievementType: AchievementType;
  timestamp: bigint;
  githubUsername: string;
  talentScore: bigint;
  isSoulbound: boolean;
  metadataURI: string;
}

// NFT metadata type
export interface DeveloperBadge {
  tokenId: bigint;
  owner: Address;
  achievement: Achievement;
}

/**
 * Get GitHub username linked to an address (VIEW FUNCTION - NO GAS)
 */
export async function getGithubUsername(
  publicClient: PublicClient,
  developerAddress: Address
): Promise<string> {
  const result = await publicClient.readContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'addressToGithub',
    args: [developerAddress],
  });

  return result as string;
}

/**
 * Get address linked to a GitHub username (VIEW FUNCTION - NO GAS)
 */
export async function getAddressFromGithub(
  publicClient: PublicClient,
  githubUsername: string
): Promise<Address> {
  const result = await publicClient.readContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'githubToAddress',
    args: [githubUsername],
  });

  return result as Address;
}

/**
 * Get Talent Protocol score for an address (VIEW FUNCTION - NO GAS)
 */
export async function getTalentScore(
  publicClient: PublicClient,
  developerAddress: Address
): Promise<bigint> {
  const result = await publicClient.readContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'talentScores',
    args: [developerAddress],
  });

  return result as bigint;
}

/**
 * Check if developer has earned a specific achievement (VIEW FUNCTION - NO GAS)
 */
export async function hasEarnedAchievement(
  publicClient: PublicClient,
  developerAddress: Address,
  achievementType: AchievementType
): Promise<boolean> {
  const result = await publicClient.readContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'hasEarnedAchievement',
    args: [developerAddress, achievementType],
  });

  return result as boolean;
}

/**
 * Get all token IDs owned by a developer (VIEW FUNCTION - NO GAS)
 */
export async function getTokensOfOwner(
  publicClient: PublicClient,
  ownerAddress: Address
): Promise<bigint[]> {
  const result = await publicClient.readContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'tokensOfOwner',
    args: [ownerAddress],
  });

  return result as bigint[];
}

/**
 * Get achievement details for a token ID (VIEW FUNCTION - NO GAS)
 */
export async function getAchievement(
  publicClient: PublicClient,
  tokenId: bigint
): Promise<Achievement> {
  const result = await publicClient.readContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'getAchievement',
    args: [tokenId],
  });

  const achievement = result as any;
  return {
    achievementType: achievement.achievementType,
    timestamp: achievement.timestamp,
    githubUsername: achievement.githubUsername,
    talentScore: achievement.talentScore,
    isSoulbound: achievement.isSoulbound,
    metadataURI: achievement.metadataURI,
  };
}

/**
 * Get total supply of NFTs (VIEW FUNCTION - NO GAS)
 */
export async function getTotalSupply(
  publicClient: PublicClient
): Promise<bigint> {
  const result = await publicClient.readContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'totalSupply',
  });

  return result as bigint;
}

/**
 * Link GitHub account to wallet (requires wallet connection)
 */
export async function linkGithubAccount(
  walletClient: WalletClient,
  account: Address,
  developerAddress: Address,
  githubUsername: string
): Promise<{ hash: Address }> {
  const hash = await walletClient.writeContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'linkGithubAccount',
    args: [developerAddress, githubUsername],
    account,
    chain: base,
  });

  return { hash };
}

/**
 * Mint achievement badge (requires trusted minter role)
 */
export async function mintAchievement(
  walletClient: WalletClient,
  account: Address,
  recipient: Address,
  achievementType: AchievementType,
  githubUsername: string,
  talentScore: bigint,
  isSoulbound: boolean,
  metadataURI: string
): Promise<{ hash: Address }> {
  const hash = await walletClient.writeContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'mintAchievement',
    args: [
      recipient,
      achievementType,
      githubUsername,
      talentScore,
      isSoulbound,
      metadataURI,
    ],
    account,
    chain: base,
  });

  return { hash };
}

/**
 * Update Talent Protocol score (requires trusted minter role)
 */
export async function updateTalentScore(
  walletClient: WalletClient,
  account: Address,
  developerAddress: Address,
  newScore: bigint
): Promise<{ hash: Address }> {
  const hash = await walletClient.writeContract({
    address: DEVELOPER_PROFILE_NFT_ADDRESS,
    abi: DEVELOPER_PROFILE_NFT_ABI,
    functionName: 'updateTalentScore',
    args: [developerAddress, newScore],
    account,
    chain: base,
  });

  return { hash };
}

/**
 * Get all badges for a developer with full details
 */
export async function getDeveloperBadges(
  publicClient: PublicClient,
  developerAddress: Address
): Promise<DeveloperBadge[]> {
  const tokenIds = await getTokensOfOwner(publicClient, developerAddress);

  const badges = await Promise.all(
    tokenIds.map(async (tokenId) => {
      const achievement = await getAchievement(publicClient, tokenId);
      return {
        tokenId,
        owner: developerAddress,
        achievement,
      };
    })
  );

  return badges;
}

/**
 * Get achievement type name
 */
export function getAchievementTypeName(type: AchievementType): string {
  const names: { [key in AchievementType]: string } = {
    [AchievementType.COMMITS_100]: '100 Commits',
    [AchievementType.COMMITS_1000]: '1000 Commits',
    [AchievementType.REPOS_10]: '10 Repositories',
    [AchievementType.REPOS_50]: '50 Repositories',
    [AchievementType.STARS_100]: '100 Stars',
    [AchievementType.STARS_1000]: '1000 Stars',
    [AchievementType.CONTRIBUTOR_10]: '10 Contributions',
    [AchievementType.CONTRIBUTOR_50]: '50 Contributions',
    [AchievementType.TALENT_VERIFIED]: 'Talent Verified',
    [AchievementType.EARLY_ADOPTER]: 'Early Adopter',
    [AchievementType.BUILDER_SCORE_HIGH]: 'High Builder Score',
  };

  return names[type] || 'Unknown Achievement';
}

/**
 * Get achievement description
 */
export function getAchievementDescription(type: AchievementType): string {
  const descriptions: { [key in AchievementType]: string } = {
    [AchievementType.COMMITS_100]: 'Made 100 commits across repositories',
    [AchievementType.COMMITS_1000]: 'Made 1000 commits across repositories',
    [AchievementType.REPOS_10]: 'Created 10 repositories',
    [AchievementType.REPOS_50]: 'Created 50 repositories',
    [AchievementType.STARS_100]: 'Received 100 stars on repositories',
    [AchievementType.STARS_1000]: 'Received 1000 stars on repositories',
    [AchievementType.CONTRIBUTOR_10]: 'Contributed to 10 different projects',
    [AchievementType.CONTRIBUTOR_50]: 'Contributed to 50 different projects',
    [AchievementType.TALENT_VERIFIED]: 'Verified by Talent Protocol',
    [AchievementType.EARLY_ADOPTER]: 'Early GitCaster platform user',
    [AchievementType.BUILDER_SCORE_HIGH]: 'Achieved high Talent Protocol builder score',
  };

  return descriptions[type] || 'Unknown achievement';
}

