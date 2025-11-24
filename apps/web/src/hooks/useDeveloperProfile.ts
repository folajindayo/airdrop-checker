/**
 * useDeveloperProfile Hook
 * 
 * React hook for interacting with the DeveloperProfileNFT contract
 * Provides functions to link GitHub accounts, view badges, and check achievements
 */

import { useState, useCallback, useEffect } from 'react';
import { Address, PublicClient, WalletClient } from 'viem';
import {
  AchievementType,
  Achievement,
  DeveloperBadge,
  getGithubUsername,
  getAddressFromGithub,
  getTalentScore,
  hasEarnedAchievement,
  getTokensOfOwner,
  getAchievement,
  getDeveloperBadges,
  linkGithubAccount,
  getAchievementTypeName,
  getAchievementDescription,
  getTotalSupply,
} from '@/lib/contracts/developer-profile-nft';

export interface DeveloperProfile {
  address: Address;
  githubUsername: string;
  talentScore: bigint;
  badges: DeveloperBadge[];
  totalBadges: number;
}

export function useDeveloperProfile(
  publicClient: PublicClient | undefined,
  walletClient: WalletClient | undefined,
  address: Address | undefined
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile data
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [totalSupply, setTotalSupply] = useState<bigint>(0n);

  // Load developer profile
  const loadProfile = useCallback(async (developerAddress: Address) => {
    if (!publicClient) return;

    try {
      setLoading(true);
      setError(null);

      const [githubUsername, talentScore, badges, supply] = await Promise.all([
        getGithubUsername(publicClient, developerAddress),
        getTalentScore(publicClient, developerAddress),
        getDeveloperBadges(publicClient, developerAddress),
        getTotalSupply(publicClient),
      ]);

      setProfile({
        address: developerAddress,
        githubUsername,
        talentScore,
        badges,
        totalBadges: badges.length,
      });

      setTotalSupply(supply);
    } catch (err: any) {
      console.error('Failed to load developer profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [publicClient]);

  // Auto-load profile when address changes
  useEffect(() => {
    if (address) {
      loadProfile(address);
    }
  }, [address, loadProfile]);

  // Link GitHub account
  const linkGithub = useCallback(
    async (developerAddress: Address, githubUsername: string) => {
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      try {
        setLoading(true);
        setError(null);

        const result = await linkGithubAccount(
          walletClient,
          address,
          developerAddress,
          githubUsername
        );

        // Reload profile after linking
        await loadProfile(developerAddress);

        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to link GitHub account';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, loadProfile]
  );

  // Check if developer has specific achievement
  const checkAchievement = useCallback(
    async (
      developerAddress: Address,
      achievementType: AchievementType
    ): Promise<boolean> => {
      if (!publicClient) return false;

      try {
        return await hasEarnedAchievement(
          publicClient,
          developerAddress,
          achievementType
        );
      } catch (err: any) {
        console.error('Failed to check achievement:', err);
        return false;
      }
    },
    [publicClient]
  );

  // Get badge details
  const getBadgeDetails = useCallback(
    async (tokenId: bigint): Promise<Achievement | null> => {
      if (!publicClient) return null;

      try {
        return await getAchievement(publicClient, tokenId);
      } catch (err: any) {
        console.error('Failed to get badge details:', err);
        return null;
      }
    },
    [publicClient]
  );

  // Find developer by GitHub username
  const findDeveloperByGithub = useCallback(
    async (githubUsername: string): Promise<Address | null> => {
      if (!publicClient) return null;

      try {
        const developerAddress = await getAddressFromGithub(
          publicClient,
          githubUsername
        );

        if (developerAddress === '0x0000000000000000000000000000000000000000') {
          return null;
        }

        return developerAddress;
      } catch (err: any) {
        console.error('Failed to find developer:', err);
        return null;
      }
    },
    [publicClient]
  );

  // Get all achievements status for current profile
  const getAchievementsStatus = useCallback(async () => {
    if (!publicClient || !profile) return [];

    const allAchievementTypes = Object.values(AchievementType).filter(
      (v) => typeof v === 'number'
    ) as AchievementType[];

    const statusPromises = allAchievementTypes.map(async (type) => {
      const earned = await hasEarnedAchievement(
        publicClient,
        profile.address,
        type
      );

      return {
        type,
        name: getAchievementTypeName(type),
        description: getAchievementDescription(type),
        earned,
      };
    });

    return await Promise.all(statusPromises);
  }, [publicClient, profile]);

  // Get soulbound badges
  const getSoulboundBadges = useCallback(() => {
    if (!profile) return [];

    return profile.badges.filter((badge) => badge.achievement.isSoulbound);
  }, [profile]);

  // Get transferable badges
  const getTransferableBadges = useCallback(() => {
    if (!profile) return [];

    return profile.badges.filter((badge) => !badge.achievement.isSoulbound);
  }, [profile]);

  return {
    // State
    loading,
    error,
    profile,
    totalSupply,

    // Functions
    loadProfile,
    linkGithub,
    checkAchievement,
    getBadgeDetails,
    findDeveloperByGithub,
    getAchievementsStatus,
    getSoulboundBadges,
    getTransferableBadges,

    // Utilities
    getAchievementTypeName,
    getAchievementDescription,

    // Enums
    AchievementType,
  };
}


