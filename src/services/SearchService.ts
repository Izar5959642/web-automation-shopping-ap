import { Product } from '../domain/Product';
import { RawProduct } from '../domain/RawProduct';
import { BaseScraper } from '../automation/BaseScraper';

/**
 * Orchestrates the product search flow.
 * Calls the scraper to fetch raw products, normalizes prices,
 * and applies optional maxPrice filtering.
 */
export class SearchService {
  private scraper: BaseScraper;

  constructor(scraper: BaseScraper) {
    this.scraper = scraper;
  }

  /**
   * Search for products and return normalized, filtered results.
   * @param query - The search term to look for
   * @param maxPrice - Optional maximum price filter
   * @returns Array of normalized products, filtered by maxPrice if provided
   */
  async search(query: string, maxPrice?: number): Promise<Product[]> {
    try {
      const rawProducts: RawProduct[] = await this.scraper.search(query);

      let products: Product[] = rawProducts.map((raw) => ({
        id: raw.id,
        title: raw.title,
        price: parseFloat(raw.price.replace(/[^0-9.]/g, '')),
        currency: raw.currency,
        imageUrl: raw.imageUrl,
        productUrl: raw.productUrl,
        source: raw.source,
      }));

      // Filter by search query if provided
      if (query && query.trim() !== '') {
        products = products.filter(p =>
          p.title.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (maxPrice !== undefined) {
        return products.filter((product) => product.price <= maxPrice);
      }

      return products;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Search service failed: ${message}`);
    }
  }
}
