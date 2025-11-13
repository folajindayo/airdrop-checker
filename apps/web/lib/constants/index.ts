/**
 * Application constants exports
 */

// Re-export shared constants
export * from '@airdrop-finder/shared/constants';

// App-specific constants
export const APP_NAME = 'Airdrop Finder';
export const APP_DESCRIPTION = 'Check your wallet eligibility for airdrops';
export const APP_VERSION = '1.0.0';

export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/yourusername/airdrop-finder',
  TWITTER: 'https://twitter.com/airdropfinder',
  DISCORD: 'https://discord.gg/airdropfinder',
  DOCS: 'https://docs.airdropfinder.com',
} as const;

export const SOCIAL_SHARE_TEXT = {
  DEFAULT: 'Check out my airdrop eligibility on Airdrop Finder!',
  WITH_SCORE: (score: number) => `I scored ${score}% on Airdrop Finder! Check your eligibility now!`,
} as const;

