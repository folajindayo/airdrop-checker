/**
 * E2E Tests for Portfolio Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Portfolio', () => {
  const testAddress = '0x' + '0'.repeat(40);

  test('should display portfolio overview', async ({ page }) => {
    await page.goto(`/portfolio?address=${testAddress}`);
    
    // Wait for portfolio data to load
    await page.waitForSelector('[data-testid="portfolio-overview"]');
    
    // Verify key elements are present
    await expect(page.locator('[data-testid="total-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="token-list"]')).toBeVisible();
  });

  test('should navigate between portfolio sections', async ({ page }) => {
    await page.goto(`/portfolio?address=${testAddress}`);
    
    // Click on tokens tab
    await page.click('[data-testid="tab-tokens"]');
    await expect(page.locator('[data-testid="token-list"]')).toBeVisible();
    
    // Click on NFTs tab
    await page.click('[data-testid="tab-nfts"]');
    await expect(page.locator('[data-testid="nft-gallery"]')).toBeVisible();
    
    // Click on DeFi tab
    await page.click('[data-testid="tab-defi"]');
    await expect(page.locator('[data-testid="defi-positions"]')).toBeVisible();
  });

  test('should compare multiple wallets', async ({ page }) => {
    await page.goto('/compare');
    
    // Add first wallet
    await page.fill('[data-testid="wallet-input-0"]', testAddress);
    
    // Add second wallet
    await page.click('[data-testid="add-wallet"]');
    await page.fill('[data-testid="wallet-input-1"]', '0x' + '1'.repeat(40));
    
    // Click compare button
    await page.click('[data-testid="compare-button"]');
    
    // Verify comparison results
    await page.waitForSelector('[data-testid="comparison-results"]');
    await expect(page.locator('[data-testid="comparison-results"]')).toBeVisible();
  });
});

