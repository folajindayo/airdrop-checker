/**
 * Integration test environment setup
 * Configures environment for integration testing
 */

/**
 * Setup integration test environment
 */
export function setupIntegrationTest() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db';
  
  // Mock external API endpoints
  process.env.GOLDRUSH_API_URL = process.env.GOLDRUSH_API_URL || 'https://api.covalenthq.com/v1';
  process.env.GOLDRUSH_API_KEY = process.env.GOLDRUSH_API_KEY || 'test-key';
  
  // Set test timeouts
  jest.setTimeout(30000);
}

/**
 * Cleanup after integration tests
 */
export function cleanupIntegrationTest() {
  // Clean up any test data
  // Close database connections
  // Clear caches
}

/**
 * Reset test environment
 */
export function resetTestEnvironment() {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset modules if needed
  jest.resetModules();
}

