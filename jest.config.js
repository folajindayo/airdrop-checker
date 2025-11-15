const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'apps/web/**/*.{js,jsx,ts,tsx}',
    '!apps/web/**/*.d.ts',
    '!apps/web/**/*.stories.{js,jsx,ts,tsx}',
    '!apps/web/**/_app.tsx',
    '!apps/web/**/_document.tsx',
    '!apps/web/**/node_modules/**',
    '!apps/web/**/.next/**',
    '!apps/web/**/coverage/**',
    '!apps/web/**/dist/**',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/coverage/',
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover',
    'html',
  ],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // The test environment that will be used for testing
  testEnvironment: 'jest-environment-jsdom',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/coverage/',
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/$1',
    '^@/components/(.*)$': '<rootDir>/apps/web/components/$1',
    '^@/lib/(.*)$': '<rootDir>/apps/web/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/apps/web/lib/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/apps/web/lib/utils/$1',
    '^@/types/(.*)$': '<rootDir>/apps/web/types/$1',
    
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': '<rootDir>/__mocks__/fileMock.js',
  },

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',

  // The number of seconds after which a test is considered as slow and reported as such in the results
  slowTestThreshold: 5,

  // Automatically reset mock state before every test
  resetMocks: true,

  // Automatically restore mock state and implementation before every test
  restoreMocks: true,

  // The root directory that Jest should scan for tests and modules within
  roots: ['<rootDir>/apps/web'],

  // A list of paths to directories that Jest should use to search for files in
  modulePaths: ['<rootDir>/apps/web'],

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverageFrom: [
    'apps/web/**/*.{js,jsx,ts,tsx}',
    '!apps/web/**/*.d.ts',
    '!apps/web/**/*.stories.{js,jsx,ts,tsx}',
    '!apps/web/**/_app.tsx',
    '!apps/web/**/_document.tsx',
    '!apps/web/**/node_modules/**',
    '!apps/web/**/.next/**',
    '!apps/web/**/coverage/**',
    '!apps/web/**/dist/**',
    '!apps/web/**/public/**',
  ],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Test timeout
  testTimeout: 10000,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

