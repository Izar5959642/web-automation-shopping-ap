import * as path from 'path';
import { Page } from 'playwright';
import { RawProduct } from '../domain/RawProduct';
import { ShippingDetails, CheckoutResult } from '../domain/Order';
import { BaseScraper } from './BaseScraper';
import { SWAGLABS_SELECTORS } from './selectors/swaglabs';

const BASE_URL = 'https://www.saucedemo.com';
const NAVIGATION_TIMEOUT = 15000;

/**
 * Concrete scraper implementation for Swag Labs (saucedemo.com).
 * Uses Playwright to automate login, product search, cart, and checkout
 * on the Swag Labs demo e-commerce site.
 */
export class SwaglabsScraper extends BaseScraper {
  private page: Page;

  constructor(page: Page) {
    super();
    this.page = page;
  }

  async login(username: string, password: string): Promise<void> {
    try {
      await this.page.goto(BASE_URL, { timeout: NAVIGATION_TIMEOUT });

      await this.page.fill(SWAGLABS_SELECTORS.usernameInput, username);
      await this.page.fill(SWAGLABS_SELECTORS.passwordInput, password);
      await this.page.click(SWAGLABS_SELECTORS.loginButton);

      await this.page.waitForSelector(SWAGLABS_SELECTORS.inventoryContainer, {
        state: 'visible',
        timeout: NAVIGATION_TIMEOUT,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Login failed: ${message}`);
    }
  }

  private async ensureSession(): Promise<void> {
    await this.page.goto(`${BASE_URL}/inventory.html`, { timeout: NAVIGATION_TIMEOUT });
    const currentUrl = this.page.url();
    if (currentUrl === BASE_URL || currentUrl === `${BASE_URL}/`) {
      await this.login('standard_user', 'secret_sauce');
      await this.page.goto(`${BASE_URL}/inventory.html`, { timeout: NAVIGATION_TIMEOUT });
    }
  }

  async search(query: string): Promise<RawProduct[]> {
    try {
      await this.ensureSession();

      await this.page.waitForSelector(SWAGLABS_SELECTORS.productItem, {
        state: 'visible',
        timeout: NAVIGATION_TIMEOUT,
      });

      const items = this.page.locator(SWAGLABS_SELECTORS.productItem);
      const count = await items.count();
      const products: RawProduct[] = [];

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);

        const title = await item.locator(SWAGLABS_SELECTORS.productName).textContent() ?? '';
        const price = await item.locator(SWAGLABS_SELECTORS.productPrice).textContent() ?? '';
        const imageUrl = await item.locator(SWAGLABS_SELECTORS.productImage).getAttribute('src') ?? '';

        products.push({
          id: title.toLowerCase().replace(/ /g, '-'),
          title,
          price,
          currency: 'USD',
          imageUrl,
          productUrl: BASE_URL,
          source: 'swaglabs',
        });
      }

      return products;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Search failed: ${message}`);
    }
  }

  async addToCart(productId: string): Promise<void> {
    try {
      await this.ensureSession();

      await this.page.waitForSelector(SWAGLABS_SELECTORS.productItem, {
        state: 'visible',
        timeout: NAVIGATION_TIMEOUT,
      });

      const items = this.page.locator(SWAGLABS_SELECTORS.productItem);
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const title = await item.locator(SWAGLABS_SELECTORS.productName).textContent() ?? '';
        const itemId = title.toLowerCase().replace(/ /g, '-');

        if (itemId === productId) {
          await item.locator('button[data-test^="add-to-cart"]').click({ timeout: NAVIGATION_TIMEOUT });

          await this.page.waitForSelector(SWAGLABS_SELECTORS.cartBadge, {
            state: 'visible',
            timeout: NAVIGATION_TIMEOUT,
          });
          console.log("--------------")
          console.log("--------------")

          return;
        }
      }

      throw new Error(`Product not found: ${productId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Add to cart failed: ${message}`);
    }
  }

  async checkout(shippingDetails: ShippingDetails): Promise<CheckoutResult> {
    try {
      await this.ensureSession();

      // Navigate to cart
      await this.page.click(SWAGLABS_SELECTORS.cartLink, { timeout: NAVIGATION_TIMEOUT });
      await this.page.waitForSelector(SWAGLABS_SELECTORS.cartItem, {
        state: 'visible',
        timeout: NAVIGATION_TIMEOUT,
      });

      // Click checkout
      await this.page.click(SWAGLABS_SELECTORS.checkoutButton, { timeout: NAVIGATION_TIMEOUT });

      // Fill shipping form
      await this.page.fill(SWAGLABS_SELECTORS.firstNameInput, shippingDetails.firstName);
      await this.page.fill(SWAGLABS_SELECTORS.lastNameInput, shippingDetails.lastName);
      await this.page.fill(SWAGLABS_SELECTORS.postalCodeInput, shippingDetails.postalCode);

      // Continue to overview
      await this.page.click(SWAGLABS_SELECTORS.continueButton, { timeout: NAVIGATION_TIMEOUT });

      // Finish checkout
      await this.page.click(SWAGLABS_SELECTORS.finishButton, { timeout: NAVIGATION_TIMEOUT });

      // Wait for confirmation
      await this.page.waitForSelector(SWAGLABS_SELECTORS.checkoutComplete, {
        state: 'visible',
        timeout: NAVIGATION_TIMEOUT,
      });

      return { success: true, screenshotPath: '' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Checkout failed: ${message}`);
    }
  }

  async takeScreenshot(filename: string): Promise<string> {
    try {
      const filepath = path.join('screenshots', filename);
      await this.page.screenshot({ path: filepath });
      return filepath;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Screenshot failed: ${message}`);
    }
  }
}
