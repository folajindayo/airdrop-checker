import {
import { NextRequest, NextResponse } from 'next/server';
import { base } from 'viem/chains';
import { createPublicClient, http, Address } from 'viem';

  getGithubUsername,
  getAddressFromGithub,
  getTalentScore,
  getDeveloperBadges,
  getTotalSupply,
  hasEarnedAchievement,
  AchievementType,
} from '@/lib/contracts/developer-profile-nft';

/**
 * GET /api/developer-profile?address=0x... OR ?github=username
 * Get developer profile and badges
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let address = searchParams.get('address');
    const github = searchParams.get('github');

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // If github username provided, lookup address
    if (github && !address) {
      const resolvedAddress = await getAddressFromGithub(publicClient, github);
      
      if (resolvedAddress === '0x0000000000000000000000000000000000000000') {
        return NextResponse.json(
          { error: 'GitHub username not linked to any address' },
          { status: 404 }
        );
      }
      
      address = resolvedAddress;
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address or github parameter' },
        { status: 400 }
      );
    }

    // Fetch developer profile data
    const [githubUsername, talentScore, badges, totalSupply] = await Promise.all([
      getGithubUsername(publicClient, address as Address),
      getTalentScore(publicClient, address as Address),
      getDeveloperBadges(publicClient, address as Address),
      getTotalSupply(publicClient),
    ]);

    // Format badges for response
    const formattedBadges = badges.map((badge) => ({
      tokenId: badge.tokenId.toString(),
      owner: badge.owner,
      achievement: {
        type: Number(badge.achievement.achievementType),
        timestamp: badge.achievement.timestamp.toString(),
        githubUsername: badge.achievement.githubUsername,
        talentScore: badge.achievement.talentScore.toString(),
        isSoulbound: badge.achievement.isSoulbound,
        metadataURI: badge.achievement.metadataURI,
      },
    }));

    return NextResponse.json({
      success: true,
      profile: {
        address,
        githubUsername,
        talentScore: talentScore.toString(),
        badges: formattedBadges,
        totalBadges: badges.length,
      },
      totalSupply: totalSupply.toString(),
    });
  } catch (error: any) {
    console.error('Developer profile API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch developer profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/developer-profile
 * Check achievement status for a developer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, achievementType } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // If specific achievement type provided, check only that
    if (achievementType !== undefined) {
      const earned = await hasEarnedAchievement(
        publicClient,
        address as Address,
        achievementType as AchievementType
      );

      return NextResponse.json({
        success: true,
        address,
        achievementType,
        earned,
      });
    }

    // Otherwise, check all achievement types
    const allAchievementTypes = Object.values(AchievementType).filter(
      (v) => typeof v === 'number'
    ) as AchievementType[];

    const achievementsStatus = await Promise.all(
      allAchievementTypes.map(async (type) => {
        const earned = await hasEarnedAchievement(
          publicClient,
          address as Address,
          type
        );

        return {
          type: Number(type),
          earned,
        };
      })
    );

    return NextResponse.json({
      success: true,
      address,
      achievements: achievementsStatus,
    });
  } catch (error: any) {
    console.error('Developer profile API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check achievement status' },
      { status: 500 }
    );
  }
}


