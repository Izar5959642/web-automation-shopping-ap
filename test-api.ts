/**
 * Test script for the API layer.
 * Run with: npx ts-node test-api.ts
 */

import { chromium } from 'playwright';
import { SwaglabsScraper } from './src/automation/SwaglabsScraper';
import { SearchService } from './src/services/SearchService';
import { PurchaseService } from './src/services/PurchaseService';
import { createServer } from './src/api/server';
import http from 'http';

const API_BASE = 'http://localhost:3000/api';

async function postJson(url: string, body: object): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

async function main(): Promise<void> {
  console.log('Starting API test...');

  const browser = await chromium.launch({ headless: true });
  console.log('Browser launched');

  let server: http.Server | null = null;

  try {
    const page = await browser.newPage();
    const scraper = new SwaglabsScraper(page);

    // Login
    console.log('Logging in...');
    await scraper.login('standard_user', 'secret_sauce');
    console.log('Login successful');

    // Create services and server
    const searchService = new SearchService(scraper);
    const purchaseService = new PurchaseService(scraper);
    const app = createServer(searchService, purchaseService);

    // Start server
    server = app.listen(3000);
    console.log('Server running on http://localhost:3000');

    // Wait for server to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // a) Test search
    console.log('\n--- Testing POST /api/search ---');
    const searchResult = await postJson(`${API_BASE}/search`, { query: '', maxPrice: 30 });
    console.log(`Request ID: ${searchResult.requestId}`);
    console.log(`Products found: ${searchResult.products.length}`);
    console.log(JSON.stringify(searchResult.products, null, 2));

    // b) Test buy
    console.log('\n--- Testing POST /api/buy ---');
    const buyResult = await postJson(`${API_BASE}/buy`, { productId: 'sauce-labs-onesie' });
    console.log('Buy result:', buyResult);

    // c) Test checkout
    console.log('\n--- Testing POST /api/checkout ---');
    const checkoutResult = await postJson(`${API_BASE}/checkout`, {
      firstName: 'Test',
      lastName: 'User',
      postalCode: '12345',
    });
    console.log('Checkout result:', checkoutResult);

    console.log('\nAPI test complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (server) {
      server.close();
      console.log('Server stopped');
    }
    await browser.close();
    console.log('Browser closed');
  }
}

main();
