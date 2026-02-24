# services/

## Responsibility

Business logic orchestration. Connects the domain and automation layers. Applies selection policy, manages flow state, normalizes prices, and filters results.

## Relationships

- **Called by**: `api/` — routes delegate to service methods
- **Calls**: `automation/` — invokes scraper methods through the BaseScraper interface
- **Uses**: `domain/` — works with domain types
- **Never imports from**: `api/`, `ui/`

## Main Classes/Functions

- **`SearchService`** — orchestrates search: calls scraper.search(), normalizes prices, applies maxPrice filter, returns Product[]
- **`PurchaseService`** — orchestrates buy and checkout: applies selection policy, calls scraper.addToCart() and scraper.checkout()
- **`SelectionPolicy`** — pure function that selects the cheapest product from a Product[] list

## Input

- Search query and optional maxPrice filter
- Product ID for purchase
- Shipping details (firstName, lastName, postalCode) for checkout
- requestId for tracing

## Output

- `Product[]` — filtered and normalized product list
- Cart status after add-to-cart
- Checkout result with success flag, screenshot path, and trace steps
