# DeveloperProfileNFT Contract Integration

This document explains how to use the DeveloperProfileNFT contract in the Airdrop Checker application.

## Contract Details

- **Contract Address**: `0x28c783CF53ae745936741869ad3258E1c0cF5B60`
- **Network**: Base Mainnet (Chain ID: 8453)
- **ABI Location**: `/abi.ts` (root directory)

## Overview

The DeveloperProfileNFT contract is an ERC-721 NFT contract for minting GitHub achievement badges and storing Talent Protocol scores. Features include:

- GitHub account linking to wallet addresses
- Soulbound (non-transferable) and regular badges
- Talent Protocol score tracking
- GitHub milestone achievements
- Builder score badges

## Usage in React Components

### 1. Using the Hook

The `useDeveloperProfile` hook provides a complete interface:

```typescript
'use client';

import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { useDeveloperProfile } from '@/hooks/useDeveloperProfile';

function DeveloperProfilePage() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const {
    loading,
    error,
    profile,
    totalSupply,
    loadProfile,
    linkGithub,
    checkAchievement,
    getAchievementsStatus,
    getSoulboundBadges,
    getTransferableBadges,
    findDeveloperByGithub,
    getAchievementTypeName,
    getAchievementDescription,
    AchievementType,
  } = useDeveloperProfile(publicClient, walletClient, address);

  // Link GitHub account
  const handleLinkGithub = async () => {
    if (!address) return;

    try {
      const result = await linkGithub(address, 'your-github-username');
      console.log('GitHub linked:', result.hash);
      
      // Profile is automatically reloaded
    } catch (err) {
      console.error('Failed to link GitHub:', err);
    }
  };

  // Check if developer has earned an achievement
  const handleCheckAchievement = async () => {
    if (!address) return;

    const hasCommits100 = await checkAchievement(
      address,
      AchievementType.COMMITS_100
    );

    console.log('Has 100 commits achievement:', hasCommits100);
  };

  // Get all achievements status
  const handleGetAllAchievements = async () => {
    const achievements = await getAchievementsStatus();
    
    achievements?.forEach((achievement) => {
      console.log(`${achievement.name}: ${achievement.earned ? '✓' : '✗'}`);
    });
  };

  return (
    <div>
      <h1>Developer Profile</h1>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {profile && (
        <div className="profile">
          <h2>Profile Details</h2>
          <p>Address: {profile.address}</p>
          <p>GitHub: {profile.githubUsername || 'Not linked'}</p>
          <p>Talent Score: {profile.talentScore.toString()}</p>
          <p>Total Badges: {profile.totalBadges}</p>

          {/* Soulbound Badges */}
          <div className="soulbound">
            <h3>Soulbound Badges ({getSoulboundBadges().length})</h3>
            {getSoulboundBadges().map((badge) => (
              <div key={badge.tokenId.toString()}>
                <p>Token #{badge.tokenId.toString()}</p>
                <p>{getAchievementTypeName(badge.achievement.achievementType)}</p>
                <p className="text-purple-500">🔒 Soulbound</p>
              </div>
            ))}
          </div>

          {/* Transferable Badges */}
          <div className="transferable">
            <h3>Transferable Badges ({getTransferableBadges().length})</h3>
            {getTransferableBadges().map((badge) => (
              <div key={badge.tokenId.toString()}>
                <p>Token #{badge.tokenId.toString()}</p>
                <p>{getAchievementTypeName(badge.achievement.achievementType)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="actions">
        {!profile?.githubUsername && (
          <button onClick={handleLinkGithub}>
            Link GitHub Account
          </button>
        )}
        <button onClick={handleCheckAchievement}>
          Check Achievement
        </button>
        <button onClick={handleGetAllAchievements}>
          Get All Achievements
        </button>
      </div>

      <div className="stats">
        <p>Total NFTs Minted: {totalSupply.toString()}</p>
      </div>
    </div>
  );
}
```

### 2. Direct Contract Functions

You can also use the contract functions directly:

```typescript
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import {
  getGithubUsername,
  getTalentScore,
  getDeveloperBadges,
  hasEarnedAchievement,
  AchievementType,
} from '@/lib/contracts/developer-profile-nft';

async function checkDeveloper(developerAddress: string) {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  // Get GitHub username (no gas required)
  const githubUsername = await getGithubUsername(
    publicClient,
    developerAddress as `0x${string}`
  );

  console.log('GitHub:', githubUsername);

  // Get Talent Protocol score
  const talentScore = await getTalentScore(
    publicClient,
    developerAddress as `0x${string}`
  );

  console.log('Talent Score:', talentScore.toString());

  // Get all badges
  const badges = await getDeveloperBadges(
    publicClient,
    developerAddress as `0x${string}`
  );

  console.log('Badges:', badges);

  // Check specific achievement
  const hasCommits = await hasEarnedAchievement(
    publicClient,
    developerAddress as `0x${string}`,
    AchievementType.COMMITS_1000
  );

  console.log('Has 1000 commits:', hasCommits);
}
```

### 3. Search by GitHub Username

You can search for developers by their GitHub username:

```typescript
import { useDeveloperProfile } from '@/hooks/useDeveloperProfile';

function SearchByGithub() {
  const { findDeveloperByGithub, loadProfile } = useDeveloperProfile(
    publicClient,
    walletClient,
    undefined
  );

  const handleSearch = async (githubUsername: string) => {
    const address = await findDeveloperByGithub(githubUsername);
    
    if (address) {
      console.log('Developer found:', address);
      await loadProfile(address);
    } else {
      console.log('GitHub username not linked');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="GitHub username"
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
```

## API Routes

Server-side API routes are available for fetching developer profiles:

### GET /api/developer-profile

Fetch developer profile by address or GitHub username:

```typescript
// By address
const response = await fetch('/api/developer-profile?address=0x1234...');
const data = await response.json();

console.log('Profile:', data.profile);

// By GitHub username
const response2 = await fetch('/api/developer-profile?github=vitalik');
const data2 = await response2.json();

console.log('Profile:', data2.profile);
```

### POST /api/developer-profile

Check achievement status for a developer:

```typescript
// Check all achievements
const response = await fetch('/api/developer-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: '0x1234...' }),
});

const data = await response.json();
console.log('Achievements:', data.achievements);

// Check specific achievement
const response2 = await fetch('/api/developer-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x1234...',
    achievementType: 0, // COMMITS_100
  }),
});

const data2 = await response2.json();
console.log('Has achievement:', data2.earned);
```

## Achievement Types

The contract supports the following GitHub achievement types:

- **COMMITS_100** (0): Made 100 commits
- **COMMITS_1000** (1): Made 1,000 commits
- **REPOS_10** (2): Created 10 repositories
- **REPOS_50** (3): Created 50 repositories
- **STARS_100** (4): Received 100 stars
- **STARS_1000** (5): Received 1,000 stars
- **CONTRIBUTOR_10** (6): Contributed to 10 projects
- **CONTRIBUTOR_50** (7): Contributed to 50 projects
- **TALENT_VERIFIED** (8): Verified by Talent Protocol
- **EARLY_ADOPTER** (9): Early platform user
- **BUILDER_SCORE_HIGH** (10): High Talent Protocol builder score

## Soulbound vs Transferable

Badges can be either **soulbound** (non-transferable) or **transferable**:

### Soulbound Badges

- Cannot be transferred to another address
- Permanently tied to the original recipient
- Ideal for credentials and verifiable achievements
- Examples: Talent Protocol verification, GitHub milestones

### Transferable Badges

- Can be transferred like normal NFTs
- Can be traded or gifted
- Useful for collectibles or rewards

The `isSoulbound` flag is set when minting the badge.

## GitHub Account Linking

Developers can link their GitHub account to their wallet address:

1. Call `linkGithubAccount` with wallet and GitHub username
2. Creates a two-way mapping: address ↔ GitHub username
3. Only one GitHub account per wallet address
4. Only one wallet address per GitHub account

## Talent Protocol Integration

The contract stores Talent Protocol scores for developers:

- Scores are stored on-chain
- Can be updated by trusted minters
- Used for achievement eligibility
- Displayed in developer profiles

## Events

The contract emits the following events:

- `AchievementMinted`: When a new badge is minted
- `GithubLinked`: When GitHub account is linked
- `TalentScoreUpdated`: When Talent Protocol score changes
- `Transfer`: Standard ERC-721 transfer event (blocked for soulbound)

## Security Notes

1. Soulbound tokens cannot be transferred (enforced in contract)
2. Only trusted minters can mint badges
3. GitHub accounts can only be linked to one address
4. Each achievement type can only be earned once per developer
5. All view functions are gas-free

## Integration with Talent Protocol

To integrate with Talent Protocol:

```typescript
// Update a developer's Talent Protocol score
// (requires trusted minter role)
import { updateTalentScore } from '@/lib/contracts/developer-profile-nft';

async function updateScore(
  walletClient: WalletClient,
  account: Address,
  developerAddress: Address,
  newScore: bigint
) {
  const result = await updateTalentScore(
    walletClient,
    account,
    developerAddress,
    newScore
  );

  console.log('Score updated:', result.hash);
}
```

## Display Badge Metadata

Each badge has a metadata URI that can be used to fetch additional information:

```typescript
const badge = await getAchievement(publicClient, tokenId);

// Fetch metadata from IPFS or server
const metadataResponse = await fetch(badge.metadataURI);
const metadata = await metadataResponse.json();

console.log('Badge metadata:', {
  name: metadata.name,
  description: metadata.description,
  image: metadata.image,
  attributes: metadata.attributes,
});
```


