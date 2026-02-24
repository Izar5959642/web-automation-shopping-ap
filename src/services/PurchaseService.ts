import { ShippingDetails, CheckoutResult } from '../domain/Order';
import { Product } from '../domain/Product';
import { BaseScraper } from '../automation/BaseScraper';

/**
 * Orchestrates the buy and checkout flows.
 * Applies selection policy, delegates to the scraper for
 * cart and checkout automation.
 */
export class PurchaseService {
  private scraper: BaseScraper;
  private cart: Product[] = [];

  constructor(scraper: BaseScraper) {
    this.scraper = scraper;
  }

  /**
   * Add a product to the cart and return the updated cart state.
   * @param product - The product to add to the cart
   * @returns Updated cart with all items and total price
   */
  async buy(product: Product): Promise<{ items: Product[]; totalPrice: number }> {
    try {
      await this.scraper.addToCart(product.id);
      this.cart.push(product);
      const totalPrice = this.cart.reduce((sum, item) => sum + item.price, 0);
      return { items: this.cart, totalPrice };
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
