/**
 * E2E Tests for Airdrop Check Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Airdrop Check', () => {
  test('should check airdrop eligibility', async ({ page }) => {
    await page.goto('/');
    
    // Enter wallet address
    await page.fill('input[placeholder*="address"]', '0x' + '0'.repeat(40));
    
    // Click check button
    await page.click('button:has-text("Check")');
    
    // Wait for results
    await page.waitForSelector('[data-testid="airdrop-results"]');
    
    // Verify results are displayed
    const results = await page.locator('[data-testid="airdrop-results"]');
    await expect(results).toBeVisible();
  });

  test('should show error for invalid address', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[placeholder*="address"]', 'invalid-address');
    await page.click('button:has-text("Check")');
    
    // Verify error message
    const error = await page.locator('[role="alert"]');
    await expect(error).toBeVisible();
  });

  test('should filter airdrops by status', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Select active filter
    await page.click('[data-testid="filter-status"]');
    await page.click('text=Active');
    
    // Verify filtered results
    await page.waitForSelector('[data-testid="airdrop-card"]');
    const cards = await page.locator('[data-testid="airdrop-card"]').count();
    expect(cards).toBeGreaterThan(0);
  });
});

