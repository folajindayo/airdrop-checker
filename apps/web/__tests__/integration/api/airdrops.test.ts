/**
 * Airdrops API Integration Tests
 */

describe('Airdrops API', () => {
  it('should fetch airdrops list', async () => {
    const response = await fetch('/api/v1/airdrops');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('success');
  });

  it('should check airdrop eligibility', async () => {
    const response = await fetch('/api/v1/airdrops/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: '0x' + '0'.repeat(40) }),
    });
    expect(response.ok).toBe(true);
  });
});

