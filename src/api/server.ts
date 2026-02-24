import express, { Express } from 'express';
import { requestIdMiddleware } from './middleware/requestId';
import { createSearchRoute } from './routes/searchRoute';
import { createBuyRoute } from './routes/buyRoute';
import { createCheckoutRoute } from './routes/checkoutRoute';
import { SearchService } from '../services/SearchService';
import { PurchaseService } from '../services/PurchaseService';

/**
 * Creates and configures the Express application.
 * Sets up JSON body parsing, requestId middleware, and all API routes.
 * @param searchService - The SearchService instance for product search
 * @param purchaseService - The PurchaseService instance for buy and checkout
 * @returns Configured Express application ready to listen
 */
export function createServer(searchService: SearchService, purchaseService: PurchaseService): Express {
  const app = express();

  // CORS for UI dev server
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.use(express.json());
  app.use(requestIdMiddleware);

  app.use('/api', createSearchRoute(searchService));
  app.use('/api', createBuyRoute(purchaseService));
  app.use('/api', createCheckoutRoute(purchaseService));

  return app;
}
