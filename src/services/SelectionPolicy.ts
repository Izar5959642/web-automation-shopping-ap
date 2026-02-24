import { Product } from '../domain/Product';

/**
 * Selects the cheapest product from the given list.
 * Products are compared by their numeric price field.
 * If multiple products share the lowest price, the first encountered is returned.
 * @param products - Array of normalized products to select from
 * @returns The product with the lowest price
 * @throws Error if the products array is empty
 */
export function selectCheapest(products: Product[]): Product {
  try {
    if (products.length === 0) {
      throw new Error('No products to select from');
    }

    const sorted = [...products].sort((a, b) => a.price - b.price);
    return sorted[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Selection failed: ${message}`);
  }
}
