# PLAN.md — Web Automation Shopping Application

## 1. Project Overview
- **Goal**: Web app that automates product search, cart, and checkout on an e-commerce site via browser automation
- **Tech Stack**: React + Express + Playwright + TypeScript
- **Target Site**: Swag Labs (https://www.saucedemo.com)
- **Selection Policy**: Select the cheapest product from search results

---

## 2. Architecture — 5 Layers

```
src/
├── automation/       # Playwright scripts, selectors, retries
├── domain/           # Models: Product, Cart, Order, Trace
├── services/         # Business logic: SearchService, PurchaseService
├── api/              # Express endpoints that trigger services
└── ui/               # React SPA (5 screens + CartContext + Header)
```

### Layer Responsibilities

| Layer | Responsibility | Key Files |
|-------|---------------|-----------|
| **`automation/`** | Browser automation via Playwright. Abstract `BaseScraper` interface + concrete implementations. Selectors, explicit waits, retries, screenshots. | `BaseScraper.ts`, `SwaglabsScraper.ts`, `selectors/swaglabs.ts` |
| **`domain/`** | Pure TypeScript types and models. No side effects, no imports from other layers. | `Product.ts`, `RawProduct.ts`, `Cart.ts`, `Order.ts`, `Trace.ts` |
| **`services/`** | Orchestrates business logic. Calls automation layer through `BaseScraper` interface, applies selection policy, manages flow state. | `SearchService.ts`, `PurchaseService.ts`, `SelectionPolicy.ts` |
| **`api/`** | Express REST routes. Generates `requestId`, delegates to services, returns structured JSON responses. | `server.ts`, `start.ts`, `searchRoute.ts`, `buyRoute.ts`, `checkoutRoute.ts`, `middleware/` |
| **`ui/`** | React SPA with 5 screens. Global cart state via CartContext. Sends requests to API, displays products. | `SearchScreen.tsx`, `ResultsScreen.tsx`, `CartScreen.tsx`, `CartStatusScreen.tsx`, `CheckoutResultScreen.tsx`, `context/CartContext.tsx`, `components/Header.tsx` |

### UI Screens
- **`SearchScreen.tsx`** — search form with query and max price inputs
- **`ResultsScreen.tsx`** — product list with "Add to Cart" buttons; button states: Adding / ✓ Added / Already in Cart
- **`CartScreen.tsx`** — displays cart contents (product list, quantities, remove buttons, total price, checkout button)
- **`CartStatusScreen.tsx`** — shipping form (firstName, lastName, postalCode); submits to `/api/checkout`
- **`CheckoutResultScreen.tsx`** — confirmation page with screenshot; clears cart on success

### UI Components
- **`components/Header.tsx`** — persistent header across all screens; shows cart item count badge; navigates to `/cart` on click
- **`context/CartContext.tsx`** — global cart state via React Context; backed by `localStorage` (`swag_cart` key); provides `addItem`, `removeItem`, `clearCart`, `getItemCount`, computed `totalPrice`

### BaseScraper — Open/Closed Principle

```
BaseScraper (abstract)
├── login(username, password): Promise<void>
├── search(query): Promise<RawProduct[]>
├── addToCart(productId): Promise<void>
├── checkout(shippingDetails): Promise<CheckoutResult>
└── takeScreenshot(filename): Promise<string>

SwaglabsScraper extends BaseScraper
  └── First (and current) concrete implementation for saucedemo.com

Adding a new website = adding a new class that extends BaseScraper.
No changes to services, api, or ui layers.
```

### RawProduct Data Format

```typescript
interface RawProduct {
  id: string;          // Unique product identifier from the source site
  title: string;       // Product name/title
  price: string;       // Raw price string as scraped from DOM (e.g. "$29.99")
  currency: string;    // Currency code (e.g. "USD")
  imageUrl: string;    // Full URL to the product image
  productUrl: string;  // Full URL to the product page
  source: string;      // Source site identifier (e.g. "swaglabs")
}
```

> `RawProduct.price` is a string; `SearchService` normalises it to a float before returning `Product[]` (where `price` is `number`).

---

## 3. Data Flow

### Search Flow
```
User types "backpack" + max price $30
  → UI: POST /api/search { query: "backpack", maxPrice: 30 }
    → API: generates requestId, calls SearchService
      → SearchService: calls scraper.search("backpack")
        → SwaglabsScraper: Playwright opens browser → logs in → reads inventory → extracts DOM
      ← returns RawProduct[]
    ← SearchService normalizes prices, applies maxPrice filter, returns Product[]
  ← API returns { requestId, products, trace }
← UI renders Results Screen
```

### Buy Flow
```
User clicks "Add to Cart" on a product
  → UI: POST /api/buy { product: Product }
    → API: calls PurchaseService.buy(product)
      → PurchaseService: calls scraper.addToCart(product.id)
      → SwaglabsScraper: clicks "Add to cart" button on saucedemo.com
    ← returns { requestId, cart: { items, totalPrice }, trace }
  ← UI calls CartContext.addItem(product) → persists to localStorage
  ← Header badge updates with new item count
  ← User navigates to /cart (via Header or explicit button) showing:
     - List of cart items (from CartContext, not API response)
     - Remove item buttons
     - Total price
     - 'Proceed to Checkout' button
```

### Checkout Flow
```
User fills shipping form on CartStatusScreen, clicks "Complete Checkout"
  → UI: POST /api/checkout { firstName, lastName, postalCode }
    → API: calls PurchaseService.checkout(shippingDetails)
      → SwaglabsScraper: fills shipping form → clicks finish → takes screenshot
    ← returns { requestId, success, screenshotPath, trace }
  ← UI navigates to /checkout-result
  ← If success: CartContext.clearCart() called → localStorage cleared
  ← UI renders CheckoutResultScreen with confirmation screenshot
```

---

## 4. Selection Policy

**Policy: "Select the cheapest product from the search results."**

- Sort `Product[]` by `price` ascending
- Select index `0` (lowest price)
- Defined in `services/SelectionPolicy.ts` as a pure function
- Edge cases:
  - Empty results → return error with clear message
  - Equal prices → pick first encountered
  - Price parse failure → exclude product, log warning

> **Status:** `SelectionPolicy.ts` is implemented but not yet wired into any service. `SearchService` currently returns all matching products to the UI. Integration into the buy flow is planned.

---

## 5. Observability

### requestId
- Generated at API layer (UUID v4) for every incoming request
- Passed as parameter through: API → Service → Automation
- Included in every log entry and returned to UI in response

### Step Tracking
Each automation action is a named step:

| Step | Description |
|------|-------------|
| `BROWSER_OPEN` | Launch Playwright browser |
| `LOGIN` | Authenticate on saucedemo.com |
| `NAVIGATE` | Go to inventory/search page |
| `SEARCH` | Apply search/filter on the page |
| `EXTRACT` | Read product data from DOM |
| `ADD_TO_CART` | Click add-to-cart for selected product |
| `CHECKOUT_START` | Navigate to checkout |
| `CHECKOUT_FILL` | Fill shipping details |
| `CHECKOUT_COMPLETE` | Click finish |
| `SCREENSHOT` | Capture confirmation screenshot |

### Log Format
```json
{
  "requestId": "abc-123",
  "step": "EXTRACT",
  "status": "success",
  "durationMs": 342,
  "timestamp": "2026-02-17T10:00:00Z",
  "error": null
}
```

### UI Trace Display
- Results and status screens show a step list
- Each step: name, status (pending/running/done/failed), duration
- On failure: step highlighted red with error message

---

## 6. API Endpoints

| Method | Path | Body | Returns |
|--------|------|------|---------|
| `POST` | `/api/search` | `{ query, maxPrice? }` | `{ requestId, products[], trace[] }` |
| `POST` | `/api/buy` | `{ product: Product }` | `{ requestId, cart: { items: Product[], totalPrice: number }, trace[] }` |
| `POST` | `/api/checkout` | `{ firstName, lastName, postalCode }` | `{ requestId, success, screenshotPath, trace[] }` |

---

## 7. Testing Strategy

### Unit Tests
- **Tool**: Vitest
- **Location**: `src/services/__tests__/`
- **Coverage**:
  - Price normalization (string → float, currency handling)
  - Selection policy (cheapest from list, empty list, equal prices)
  - Cart calculations

### E2E Tests (at least 1)
- **Tool**: Playwright Test
- **Location**: `e2e/`
- **Coverage**: Full flow: Search → Add to Cart → Checkout → Verify screenshot exists
- Runs against live saucedemo.com

---

## 8. Target Site Details — Swag Labs

- **URL**: https://www.saucedemo.com
- **Demo credentials**: `standard_user` / `secret_sauce`
- **Features**: Product catalog, sorting, cart, checkout with shipping form, confirmation page
- **Advantages**: Stable DOM, designed for testing, no CAPTCHA, no rate limiting

---

> **Note:** Cart screen was initially missed in the original implementation. It should display actual cart contents, not just a success message.

---

## 9. Submission Requirements

### Required Documentation Files

| File | Contents |
|------|----------|
| `README.md` | Project overview, tech stack, setup instructions, and how to run the app and tests |
| `AI_USAGE.md` | Description of how AI tools (e.g. Claude Code) were used during development — which tasks, what prompts, what was generated |
| `README_AI_BUGS.md` | Bugs encountered and fixed with AI assistance — what the bug was, how AI helped diagnose or fix it |

### Required Test Outputs

| Output | How to Produce |
|--------|---------------|
| Unit test results | Run `npm test` — console output showing all Vitest tests passing |
| E2E test results | Run `npm run test:e2e` — Playwright Test output showing the full flow passing |
| Screenshot | Automatically saved to `screenshots/` after a successful checkout run |

---

## 10. Implementation Order

The three remaining open requirements are completed in this order:

| Order | Area | Requirements closed | Rationale |
|-------|------|---------------------|-----------|
| 1st | SelectionPolicy wiring | 1 | Smallest change (1 file), zero risk, no new dependencies |
| 2nd | Observability | 2 | Medium effort, infrastructure-level, enriches the app before tests validate it |
| 3rd | Testing | 5 | Largest effort — requires new dependencies, config files, and 4 new test files |

> **Note:** Phases are ordered by implementation complexity (smallest first), not by compliance impact. Testing covers the most requirements (5) but was intentionally left last to build on a fully working and observable system.

---

## 11. Verification

1. `npm run dev` — starts both Express API and React UI
2. Open UI → type search query → see products from Swag Labs
3. Click "Buy" → see cart status with step trace
4. Fill checkout form → see confirmation + screenshot
5. `npm test` — unit tests pass
6. `npm run test:e2e` — full flow test passes, screenshot saved
