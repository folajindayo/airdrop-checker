import type { Config } from 'jest';
import baseConfig from './jest.config';

/**
 * Enhanced Jest Configuration with Coverage Thresholds
 */
const config: Config = {
  ...baseConfig,
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.ts',
  ],

  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
    './src/services/': {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    './src/core/utils/': {
      branches: 85,
      functions: 90,
      lines: 95,
      statements: 95,
    },
  },

  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Test timeout
  testTimeout: 10000,

  // Verbose output for CI
  verbose: process.env.CI === 'true',

  // Fail fast in CI
  bail: process.env.CI === 'true' ? 1 : 0,

  // Max workers
  maxWorkers: process.env.CI === 'true' ? 2 : '50%',
};

export default config;

