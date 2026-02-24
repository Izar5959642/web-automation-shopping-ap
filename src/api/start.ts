/**
 * API server startup script.
 * Launches browser, logs in, creates services, and starts Express server.
 * Run with: npx ts-node src/api/start.ts
 */

import { chromium } from 'playwright';
import { SwaglabsScraper } from '../automation/SwaglabsScraper';
import { SearchService } from '../services/SearchService';
import { PurchaseService } from '../services/PurchaseService';
import { createServer } from './server';
import express from 'express';
import path from 'path';

const PORT = 3000;

async function main(): Promise<void> {
  console.log('Starting API server...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const scraper = new SwaglabsScraper(page);

  console.log('Logging in to Swag Labs...');
  await scraper.login('standard_user', 'secret_sauce');
  console.log('Login successful');

  const searchService = new SearchService(scraper);
  const purchaseService = new PurchaseService(scraper);
  const app = createServer(searchService, purchaseService);

  // Serve screenshots as static files
  app.use('/screenshots', express.static(path.join(process.cwd(), 'screenshots')));

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error('Failed to start API server:', error);
  process.exit(1);
});
