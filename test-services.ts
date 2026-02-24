/**
 * Test script for the services layer.
 * Run with: npx ts-node test-services.ts
 */
import * as readline from 'readline';

import { chromium } from 'playwright';
import { SwaglabsScraper } from './src/automation/SwaglabsScraper';
import { SearchService } from './src/services/SearchService';
import { PurchaseService } from './src/services/PurchaseService';
import { ShippingDetails } from './src/domain/Order';

async function main(): Promise<void> {
  console.log('Starting services test...');

  const browser = await chromium.launch({ headless: false });
  console.log('Browser launched');

  try {
    const page = await browser.newPage();
    const scraper = new SwaglabsScraper(page);

    // Login
    console.log('Logging in...');
    await scraper.login('standard_user', 'secret_sauce');
    console.log('Login successful');

    // Search with maxPrice filter
    const searchService = new SearchService(scraper);
    console.log('Searching for products with maxPrice $30...');
    const products = await searchService.search('', 30);
    console.log(`Filtered products (price <= $30): ${products.length}`);
    console.log(JSON.stringify(products, null, 2));

    // Buy the cheapest product
    const purchaseService = new PurchaseService(scraper);
    const cheapest = products.sort((a, b) => a.price - b.price)[0];
    console.log(`Cheapest product: ${cheapest.title} ($${cheapest.price})`);

    console.log('Adding to cart...');
    await purchaseService.buy(cheapest);
    console.log('Product added to cart');

    // Checkout
    console.log('Starting checkout...');
    const shippingDetails: ShippingDetails = {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345',
    };
    const result = await purchaseService.checkout(shippingDetails);
    console.log('Checkout result:', result);

    console.log('Services test complete');

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      await new Promise<void>((resolve) => {
        rl.question('Press Enter to close the browser...', () => {
          rl.close();
          resolve();
        });
      });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

main();
