import { Router } from 'express';
import { PurchaseService } from '../../services/PurchaseService';

/**
 * Creates a router for the POST /buy endpoint.
 * Accepts a full Product object, delegates to PurchaseService to add it to the cart,
 * and returns the updated cart state with trace data.
 *
 * Request body: { product: Product }
 * Response: { requestId: string, cart: { items: Product[], totalPrice: number }, trace: TraceStep[] }
 *
 * @param purchaseService - The PurchaseService instance to delegate buy logic to
 * @returns Configured Express Router
 */
export function createBuyRoute(purchaseService: PurchaseService): Router {
  const router = Router();

  router.post('/buy', async (req, res) => {
    try {
      const requestId = (req as any).requestId;
      const { product } = req.body;

      const result = await purchaseService.buy(product);

      res.json({ requestId, cart: result, trace: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  return router;
}
