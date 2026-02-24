import { RawProduct } from '../domain/RawProduct';
import { ShippingDetails, CheckoutResult } from '../domain/Order';

/**
 * Abstract base class for browser automation scrapers.
 * Defines the contract that all site-specific scrapers must implement.
 * To add support for a new website, extend this class — never modify it.
 */
export abstract class BaseScraper {
  /**
   * Authenticate on the target site using the provided credentials.
   * @param username - The login username
   * @param password - The login password
   */
  abstract login(username: string, password: string): Promise<void>;

  /**
   * Search for products matching the given query on the target site.
   * Returns raw product data extracted directly from the DOM.
   * @param query - The search term to look for
   * @returns Array of raw product data scraped from the page
   */
  abstract search(query: string): Promise<RawProduct[]>;

  /**
   * Add a product to the shopping cart on the target site.
   * @param productId - The unique identifier of the product to add
   */
  abstract addToCart(productId: string): Promise<void>;

  /**
   * Complete the checkout flow by filling in shipping details and confirming the order.
   * @param shippingDetails - Customer shipping information (name, postal code)
   * @returns Result indicating success/failure and path to confirmation screenshot
   */
  abstract checkout(shippingDetails: ShippingDetails): Promise<CheckoutResult>;

  /**
   * Capture a screenshot of the current browser page and save it to disk.
   * @param filename - The name for the screenshot file
   * @returns The full file path where the screenshot was saved
   */
  abstract takeScreenshot(filename: string): Promise<string>;
}
