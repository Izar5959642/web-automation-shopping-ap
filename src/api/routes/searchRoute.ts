import { Router } from 'express';
import { SearchService } from '../../services/SearchService';

/**
 * Creates a router for the POST /search endpoint.
 * Accepts a search query and optional maxPrice filter,
 * delegates to SearchService, and returns normalized products with trace data.
 *
 * Request body: { query: string, maxPrice?: number }
 * Response: { requestId: string, products: Product[], trace: TraceStep[] }
 *
 * @param searchService - The SearchService instance to delegate search logic to
 * @returns Configured Express Router
 */
export function createSearchRoute(searchService: SearchService): Router {
  const router = Router();

  router.post('/search', async (req, res) => {
    try {
      const requestId = (req as any).requestId;
      const { query, maxPrice } = req.body;

      const products = await searchService.search(query, maxPrice);

      res.json({ requestId, products, trace: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  return router;
}
