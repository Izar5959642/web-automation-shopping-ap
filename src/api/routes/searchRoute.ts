import { Router } from 'express';
import { SearchService } from '../../services/SearchService';
import { selectCheapest } from '../../services/SelectionPolicy';
import { TraceCollector } from '../TraceCollector';

/**
 * Creates a router for the POST /search endpoint.
 * Accepts a search query and optional maxPrice filter,
 * delegates to SearchService, and returns normalized products with trace data.
 *
 * Request body: { query: string, maxPrice?: number }
 * Response: { requestId: string, products: Product[], selectedProduct: Product | null, trace: TraceStep[] }
 *
 * @param searchService - The SearchService instance to delegate search logic to
 * @returns Configured Express Router
 */
export function createSearchRoute(searchService: SearchService): Router {
  const router = Router();

  router.post('/search', async (req, res) => {
    const collector = new TraceCollector();
    try {
      const requestId = (req as any).requestId;
      const { query, maxPrice } = req.body;

      let products: Awaited<ReturnType<typeof searchService.search>> = [];
      await collector.record(requestId, 'SCRAPE', async () => {
        products = await searchService.search(query, maxPrice);
      });

      const selectedProduct = products.length > 0 ? selectCheapest(products) : null;

      res.json({ requestId, products, selectedProduct, trace: collector.getSteps() });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message, trace: collector.getSteps() });
    }
  });

  return router;
}
