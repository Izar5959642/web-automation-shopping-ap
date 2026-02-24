import { Product } from './Product';

/**
 * Represents the current state of the shopping cart.
 */
export interface Cart {
  /** Products currently in the cart */
  items: Product[];

  /** Sum of all item prices */
  totalPrice: number;

  /** Currency code for the total (e.g. "USD") */
  currency: string;
}
