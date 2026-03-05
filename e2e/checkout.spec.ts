import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('full checkout flow: search → add to cart → checkout → success', async ({ page }) => {
  // Ensure screenshots directory exists
  const screenshotsDir = path.join(__dirname, 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Step 1: Navigate to search screen
  await page.goto('/');
  await expect(page.locator('#query')).toBeVisible();

  // Step 2: Search for backpack
  await page.fill('#query', 'backpack');
  await page.click('button[type="submit"]');

  // Step 3: Wait for results screen
  await expect(page.locator('h1:has-text("Search Results")')).toBeVisible({ timeout: 30000 });
  const firstAddToCart = page.locator('button:has-text("Add to Cart")').first();
  await expect(firstAddToCart).toBeVisible();

  // Step 4: Add first product to cart
  await firstAddToCart.click();
  await expect(page.locator('button:has-text("✓ Added")').first()).toBeVisible({ timeout: 10000 });

  // Step 5: Navigate to cart status (shipping form)
  await page.goto('/cart-status');
  await expect(page.locator('h2:has-text("Shipping Details")')).toBeVisible();

  // Step 6: Fill in shipping details
  await page.fill('#firstName', 'Test');
  await page.fill('#lastName', 'User');
  await page.fill('#postalCode', '12345');

  // Step 7: Complete checkout
  await page.click('button:has-text("Complete Checkout")');

  // Step 8: Assert success screen
  await expect(page.locator('text=Order completed successfully!')).toBeVisible({ timeout: 30000 });

  // Step 9: Assert trace steps are visible
  await expect(page.locator('text=Automation Steps')).toBeVisible();

  // Step 10: Take screenshot as proof of successful checkout
  await page.screenshot({ path: path.join(screenshotsDir, 'checkout-success.png') });
});
