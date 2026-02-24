# automation/

## Responsibility

Browser automation via Playwright. Launches headless browsers, navigates pages, interacts with DOM elements, extracts data, and captures screenshots. All direct browser interaction lives here.

## Relationships

- **Called by**: `services/` — services invoke scraper methods to perform automation tasks
- **Uses**: `domain/` — returns domain types (RawProduct, CheckoutResult)
- **Never imports from**: `api/`, `ui/`

## Main Classes/Functions

- **`BaseScraper`** (abstract class) — defines the scraper interface: `login()`, `search()`, `addToCart()`, `checkout()`, `takeScreenshot()`
- **`SwaglabsScraper`** (extends BaseScraper) — concrete implementation for saucedemo.com
- **`selectors/swaglabs.ts`** — CSS/data-test selectors for Swag Labs DOM elements

## Input

- Credentials (username, password)
- Search query and filters
- Product ID for add-to-cart
- Shipping details for checkout
- requestId for trace/logging

## Output

- `RawProduct[]` — scraped product data from the page
- `CheckoutResult` — success/failure of checkout
- `Buffer` — screenshot image data
- `TraceStep[]` — step-by-step log of automation actions
