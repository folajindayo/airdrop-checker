/**
 * Test Helper Utilities
 * Utility functions for testing
 */

export function createMockAddress(): string {
  return `0x${'0'.repeat(40)}`;
}

export function createMockTxHash(): string {
  return `0x${'0'.repeat(64)}`;
}

export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function mockFetch(data: any, status: number = 200) {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}

