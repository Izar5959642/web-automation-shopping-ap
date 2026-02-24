import { Product } from './Product';

/**
 * Shipping details provided by the user during checkout.
 */
export interface ShippingDetails {
  /** Customer first name */
  firstName: string;

  /** Customer last name */
  lastName: string;

  /** Postal/zip code */
  postalCode: string;
}

/**
 * Result returned by the scraper after completing the checkout flow.
 */
export interface CheckoutResult {
  /** Whether the checkout completed successfully */
  success: boolean;

  /** Path to the confirmation screenshot file */
  screenshotPath: string;
}

/**
 * Represents a completed (or failed) checkout order.
 */
export interface Order {
  /** Products included in the order */
  products: Product[];

  /** Shipping details submitted during checkout */
  shippingDetails: ShippingDetails;

  /** Total price of all products */
  totalPrice: number;

  /** Whether the checkout completed successfully */
  success: boolean;

  /** Path to the confirmation screenshot file */
  screenshotPath: string;
}
