import { Router } from 'express';
import { PurchaseService } from '../../services/PurchaseService';

/**
 * Creates a router for the POST /checkout endpoint.
 * Accepts shipping details, delegates to PurchaseService to complete checkout,
 * and returns success status with screenshot path and trace data.
 *
 * Request body: { firstName: string, lastName: string, postalCode: string }
 * Response: { requestId: string, success: boolean, screenshotPath: string, trace: TraceStep[] }
 *
 * @param purchaseService - The PurchaseService instance to delegate checkout logic to
 * @returns Configured Express Router
 */
export function createCheckoutRoute(purchaseService: PurchaseService): Router {
  const router = Router();

  router.post('/checkout', async (req, res) => {
    try {
      const requestId = (req as any).requestId;
      const { firstName, lastName, postalCode } = req.body;
      const shippingDetails = { firstName, lastName, postalCode };

      const result = await purchaseService.checkout(shippingDetails);

      res.json({
        requestId,
        success: result.success,
        screenshotPath: result.screenshotPath,
        trace: [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  return router;
}
