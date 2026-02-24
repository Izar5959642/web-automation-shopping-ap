/**
 * Normalized product with a numeric price.
 * Created by the services layer after parsing and validating a RawProduct.
 */
export interface Product {
  /** Unique product identifier from the source site */
  id: string;

  /** Product name/title */
  title: string;

  /** Numeric price value after normalization */
  price: number;

  /** Currency code (e.g. "USD") */
  currency: string;

  /** Full URL to the product image */
  imageUrl: string;

  /** Full URL to the product page */
  productUrl: string;

  /** Source site identifier (e.g. "swaglabs") */
  source: string;
}
