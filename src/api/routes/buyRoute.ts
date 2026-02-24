import { Router } from 'express';
import { PurchaseService } from '../../services/PurchaseService';

/**
 * Creates a router for the POST /buy endpoint.
 * Accepts a productId, delegates to PurchaseService to add the product to cart,
 * and returns cart status with trace data.
 *
 * Request body: { productId: string }
 * Response: { requestId: string, cartStatus: string, trace: TraceStep[] }
 *
 * @param purchaseService - The PurchaseService instance to delegate buy logic to
 * @returns Configured Express Router
 */
export function createBuyRoute(purchaseService: PurchaseService): Router {
  const router = Router();

  router.post('/buy', async (req, res) => {
    try {
      const requestId = (req as any).requestId;
      const { productId } = req.body;

      await purchaseService.buy(productId);

      res.json({ requestId, cartStatus: 'Product added', trace: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  return router;
}
