/**
 * CSS selectors for Swag Labs (saucedemo.com) DOM elements.
 * All browser interactions with Swag Labs should reference these selectors
 * to keep selector maintenance centralized.
 */
export const SWAGLABS_SELECTORS = {
  /** Username input field on the login page */
  usernameInput: '#user-name',

  /** Password input field on the login page */
  passwordInput: '#password',

  /** Login submit button */
  loginButton: '#login-button',

  /** Main inventory container on the products page */
  inventoryContainer: '.inventory_list',

  /** Individual product item card */
  productItem: '.inventory_item',

  /** Product name/title element within a product card */
  productName: '.inventory_item_name',

  /** Product price element within a product card */
  productPrice: '.inventory_item_price',

  /** Product image element within a product card */
  productImage: 'img.inventory_item_img',

  // ── Cart selectors ──

  /** Add-to-cart button for a specific product (uses data-test attribute) */
  addToCartButton: (productId: string) => `[data-test="add-to-cart-${productId}"]`,

  /** Shopping cart icon/link in the header */
  cartLink: '.shopping_cart_link',

  /** Cart badge showing item count */
  cartBadge: '.shopping_cart_badge',

  /** Individual cart item on the cart page */
  cartItem: '.cart_item',

  // ── Checkout selectors ──

  /** Checkout button on the cart page */
  checkoutButton: '[data-test="checkout"]',

  /** First name input on the checkout info page */
  firstNameInput: '[data-test="firstName"]',

  /** Last name input on the checkout info page */
  lastNameInput: '[data-test="lastName"]',

  /** Postal code input on the checkout info page */
  postalCodeInput: '[data-test="postalCode"]',

  /** Continue button on the checkout info page */
  continueButton: '[data-test="continue"]',

  /** Finish button on the checkout overview page */
  finishButton: '[data-test="finish"]',

  /** Confirmation header on the checkout complete page */
  checkoutComplete: '.complete-header',
};
