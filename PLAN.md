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
└── ui/               # React SPA (4 screens)
```

### Layer Responsibilities

| Layer | Responsibility | Key Files |
|-------|---------------|-----------|
| **`automation/`** | Browser automation via Playwright. Abstract `BaseScraper` interface + concrete implementations. Selectors, explicit waits, retries, screenshots. | `BaseScraper.ts`, `SwaglabsScraper.ts`, `selectors/swaglabs.ts` |
| **`domain/`** | Pure TypeScript types and models. No side effects, no imports from other layers. | `Product.ts`, `Cart.ts`, `Order.ts`, `Trace.ts` |
| **`services/`** | Orchestrates business logic. Calls automation layer through `BaseScraper` interface, applies selection policy, manages flow state. | `SearchService.ts`, `PurchaseService.ts`, `SelectionPolicy.ts` |
| **`api/`** | Express REST routes. Generates `requestId`, delegates to services, returns structured JSON responses. | `searchRoute.ts`, `buyRoute.ts`, `checkoutRoute.ts`, `middleware/` |
| **`ui/`** | React SPA with 4 screens. Sends requests to API, displays products and step-by-step trace info. | `SearchScreen.tsx`, `ResultsScreen.tsx`, `CartStatusScreen.tsx`, `CheckoutResultScreen.tsx` |

### BaseScraper — Open/Closed Principle

```
BaseScraper (abstract)
├── login(credentials): Promise<void>
├── search(query, filters): Promise<RawProduct[]>
├── addToCart(productId): Promise<void>
├── checkout(shippingDetails): Promise<CheckoutResult>
└── takeScreenshot(): Promise<Buffer>

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
  price: number;       // Numeric price value
  currency: string;    // Currency code (e.g. "USD")
  imageUrl: string;    // Full URL to the product image
  productUrl: string;  // Full URL to the product page
  source: string;      // Source site identifier (e.g. "swaglabs")
}
```

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
← UI renders Results Screen + trace sidebar
```

### Buy Flow
```
User clicks "Buy" on a product
  → UI: POST /api/buy { productId }
    → API: calls PurchaseService
      → PurchaseService: applies selection policy (cheapest), calls scraper.addToCart()
        → SwaglabsScraper: clicks "Add to cart" on the product page
      ← returns cart state
  ← UI renders Cart/Status Screen with automation steps
```

### Checkout Flow
```
User fills shipping form, clicks "Complete"
  → UI: POST /api/checkout { firstName, lastName, postalCode }
    → API: calls PurchaseService.checkout()
      → SwaglabsScraper: fills shipping form → clicks finish → takes screenshot
    ← returns { success, screenshotPath, trace }
  ← UI renders Checkout Result Screen with confirmation screenshot
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
| `POST` | `/api/buy` | `{ productId }` | `{ requestId, cartStatus, trace[] }` |
| `POST` | `/api/checkout` | `{ firstName, lastName, postalCode }` | `{ requestId, success, screenshotPath, trace[] }` |

---

## 7. Testing Strategy

### Unit Tests
- Price normalization (string → float, currency handling)
- Selection policy (cheapest from list, empty list, equal prices)
- Cart calculations

### E2E Test (at least 1)
- Full flow: Search → Add to Cart → Checkout → Verify screenshot exists
- Uses Playwright Test runner against live saucedemo.com

---

## 8. Target Site Details — Swag Labs

- **URL**: https://www.saucedemo.com
- **Demo credentials**: `standard_user` / `secret_sauce`
- **Features**: Product catalog, sorting, cart, checkout with shipping form, confirmation page
- **Advantages**: Stable DOM, designed for testing, no CAPTCHA, no rate limiting

---

## 9. Verification

1. `npm run dev` — starts both Express API and React UI
2. Open UI → type search query → see products from Swag Labs
3. Click "Buy" → see cart status with step trace
4. Fill checkout form → see confirmation + screenshot
5. `npm test` — unit tests pass
6. `npm run test:e2e` — full flow test passes, screenshot saved
