/**
 * Raw product data scraped directly from a target e-commerce site.
 * Prices are kept as strings since they come from DOM text content
 * and need normalization before use.
 */
export interface RawProduct {
  /** Unique product identifier from the source site */
  id: string;

  /** Product name/title as displayed on the page */
  title: string;

  /** Raw price string extracted from the DOM (e.g. "$29.99") */
  price: string;

  /** Currency code (e.g. "USD") */
  currency: string;

  /** Full URL to the product image */
  imageUrl: string;

  /** Full URL to the product page */
  productUrl: string;

  /** Source site identifier (e.g. "swaglabs") */
  source: string;
}
