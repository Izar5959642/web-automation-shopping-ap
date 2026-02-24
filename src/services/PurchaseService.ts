import { ShippingDetails, CheckoutResult } from '../domain/Order';
import { BaseScraper } from '../automation/BaseScraper';

/**
 * Orchestrates the buy and checkout flows.
 * Applies selection policy, delegates to the scraper for
 * cart and checkout automation.
 */
export class PurchaseService {
  private scraper: BaseScraper;

  constructor(scraper: BaseScraper) {
    this.scraper = scraper;
  }

  /**
   * Add a product to the cart by its ID.
   * @param productId - The unique identifier of the product to purchase
   */
  async buy(productId: string): Promise<void> {
    try {
      await this.scraper.addToCart(productId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Buy failed: ${message}`);
    }
  }

  /**
   * Complete the checkout flow with the given shipping details.
   * Fills shipping form, confirms order, and captures a screenshot.
   * @param shippingDetails - Customer shipping information
   * @returns Result indicating success/failure and screenshot path
   */
  async checkout(shippingDetails: ShippingDetails): Promise<CheckoutResult> {
    try {
      const result = await this.scraper.checkout(shippingDetails);
      const filename = `checkout-${Date.now()}.png`;
      const screenshotPath = await this.scraper.takeScreenshot(filename);

      return { success: result.success, screenshotPath };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Checkout failed: ${message}`);
    }
  }
}
