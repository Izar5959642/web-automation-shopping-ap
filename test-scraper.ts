/**
 * Temporary manual test script for SwaglabsScraper.
 * Run with:
 *   npx ts-node test-scraper.ts          (will prompt for mode)
 *   npx ts-node test-scraper.ts headed    (browser visible)
 *   npx ts-node test-scraper.ts headless  (no browser window)
 */

import { chromium } from 'playwright';
import * as readline from 'readline';
import { SwaglabsScraper } from './src/automation/SwaglabsScraper';

function askMode(): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log('Select browser mode:');
    console.log('  1) headed   — browser window visible');
    console.log('  2) headless — no browser window');
    rl.question('Enter 1 or 2: ', (answer) => {
      rl.close();
      resolve(answer.trim() === '2');
    });
  });
}

async function main(): Promise<void> {
  // Determine headless mode from CLI arg or interactive prompt
  const arg = process.argv[2];
  let headless: boolean;
  if (arg === 'headed') {
    headless = false;
  } else if (arg === 'headless') {
    headless = true;
  } else {
    headless = await askMode();
  }

  console.log(`Starting test in ${headless ? 'headless' : 'headed'} mode...`);

  const browser = await chromium.launch({ headless });
  console.log('Browser launched');

  try {
    // Create a new browser page
    const page = await browser.newPage();

    // Create scraper instance with the page
    const scraper = new SwaglabsScraper(page);

    // Log in with Swag Labs demo credentials
    console.log('Logging in...');
    await scraper.login('standard_user', 'secret_sauce');
    console.log('Login successful');

    // Search with empty query to get all products
    console.log('Searching for products...');
    const products = await scraper.search('');
    console.log('Products found:', products.length);
    console.log(JSON.stringify(products, null, 2));

    // Find the cheapest product by parsing the price string
    console.log('Adding cheapest product to cart...');
    const sorted = [...products].sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return priceA - priceB;
    });
    const cheapest = sorted[0];
    console.log(`Cheapest product: ${cheapest.title} (${cheapest.price})`);

    await scraper.addToCart(cheapest.id);
    console.log('Product added successfully');

    // Checkout with test shipping details
    console.log('Starting checkout...');
    const result = await scraper.checkout({
      firstName: 'Test',
      lastName: 'User',
      postalCode: '12345',
    });
    console.log('Checkout result:', result);

    // Take a screenshot of the confirmation page
    console.log('Taking screenshot...');
    const screenshotPath = await scraper.takeScreenshot('checkout-confirmation.png');
    console.log('Screenshot saved to:', screenshotPath);

    console.log('Test complete');

    // In headed mode, wait for user to press Enter before closing
    if (!headless) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      await new Promise<void>((resolve) => {
        rl.question('Press Enter to close the browser...', () => {
          rl.close();
          resolve();
        });
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Always close the browser, even if an error occurred
    await browser.close();
  }
}

main();
