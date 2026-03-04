# README_AI_BUGS.md

Bugs encountered during development that caused broken functionality — how each was discovered, why it happened, and what changed to fix it.

---

## Bug 1 — Session Timeout After 13 Minutes

### Description

Searches that worked correctly at server startup began throwing the following error after the server had been running idle for approximately 13 minutes:

```
Add to cart failed: Product not found: sauce-labs-backpack
```

The product had been found and displayed in the UI moments before. The server had not restarted. The same search query that succeeded earlier now failed.

### Discovery

The bug appeared only after an idle period between requests. When the app was used continuously it worked fine, but leaving the server running while switching to another task and coming back triggered it reliably. The 13-minute window was established through repeated observation during testing — it is not a figure documented by Swag Labs.

### Root Cause

`start.ts` called `scraper.login()` once at server startup and assumed the resulting Playwright session would remain valid for the lifetime of the process:

```typescript
// start.ts — original AI-generated code
const scraper = new SwaglabsScraper(page);
await scraper.login('standard_user', 'secret_sauce');
// Session assumed valid forever from this point on
```

Saucedemo.com expires its session cookie after approximately 13 minutes of inactivity. When a new API request arrived after that window, `search()` navigated to `/inventory.html` — but the site redirected the browser back to the login page at `https://www.saucedemo.com/`. The scraper did not detect the redirect. It proceeded to wait for inventory product elements on the login page, found none (the login page has no `.inventory_item` elements), and returned an empty product array. When `addToCart()` subsequently tried to find the product by ID in that empty result, it threw `"Product not found"`.

### AI's Role

AI generated the initial `start.ts` with the one-shot login and no session re-validation logic. The AI treated the Playwright session as permanent, which is incorrect for any site with session expiry. AI later helped write the `ensureSession()` fix once the root cause was identified.

### Debugging Process

1. Noticed the error only appeared after idle periods, never during continuous use.
2. Added a temporary `console.log(page.url())` before the `waitForSelector` call in `search()`.
3. On the next timeout, the log printed `https://www.saucedemo.com/` — the login page URL — instead of `https://www.saucedemo.com/inventory.html`.
4. This confirmed the browser had been redirected by session expiry, not that the selector was wrong or the site was down.

### The Fix

Added `ensureSession()` to `SwaglabsScraper`, called at the start of both `search()` and `addToCart()`:

**Before:**
```typescript
async search(query: string): Promise<RawProduct[]> {
  // Assumed page was already on inventory — no check
  await this.page.waitForSelector(SWAGLABS_SELECTORS.productItem, {
    state: 'visible',
    timeout: NAVIGATION_TIMEOUT,
  });
  // ... scrape products
}
```

**After:**
```typescript
private async ensureSession(): Promise<void> {
  await this.page.goto(`${BASE_URL}/inventory.html`, { timeout: NAVIGATION_TIMEOUT });
  const currentUrl = this.page.url();
  if (currentUrl === BASE_URL || currentUrl === `${BASE_URL}/`) {
    // Session expired — redirected to login page, re-authenticate
    await this.login('standard_user', 'secret_sauce');
    await this.page.goto(`${BASE_URL}/inventory.html`, { timeout: NAVIGATION_TIMEOUT });
  }
}

async search(query: string): Promise<RawProduct[]> {
  await this.ensureSession(); // validate session before every scrape
  await this.page.waitForSelector(SWAGLABS_SELECTORS.productItem, {
    state: 'visible',
    timeout: NAVIGATION_TIMEOUT,
  });
  // ... scrape products
}
```

The check works by navigating to the expected page and then reading `page.url()`. If saucedemo.com redirected the browser back to the root URL, the session has expired and a fresh login is performed before continuing.

### Lesson Learned

Never assume a browser automation session persists for the lifetime of a server process. Any site with authentication can expire the session at any time. The correct pattern is to validate the session state at the start of every operation that requires it, not just at startup.

---

## Bug 2 — Cart Empty When Navigating via Header Icon

### Description

After adding one or more items in `ResultsScreen`, clicking the cart icon in the persistent `Header` component displayed an empty cart. The same behavior occurred when pressing the browser back button and returning to the cart, or when refreshing the page.

### Discovery

Found during manual UI testing of the navigation flow. The bug reproduced 100% of the time when using the header icon to reach the cart. It did not reproduce when a "Go to Cart" button in `ResultsScreen` was used — because that button passed state directly through the router.

### Root Cause

The AI-generated cart implementation transported cart items as React Router `location.state`:

```typescript
// ResultsScreen.tsx — original AI-generated code
const [cart, setCart] = useState<Product[]>([]);

function handleAddToCart(product: Product) {
  const updated = [...cart, product];
  setCart(updated);
  navigate('/cart', { state: { cartItems: updated } });
}
```

```typescript
// CartScreen.tsx — original AI-generated code
const { cartItems } = location.state as { cartItems: Product[] };
```

`location.state` is ephemeral — it exists only for the specific navigation event that carried it. Three scenarios silently destroyed the cart:

1. **Header icon navigation:** `Header` called `navigate('/cart')` with no state. `location.state` was `null`. The cart rendered empty.
2. **Back + forward navigation:** React Router discards `location.state` after leaving the route. Returning to `/cart` via the back button gave a fresh, empty state object.
3. **Page refresh:** `location.state` is not persisted across browser refreshes. A hard refresh always produced an empty cart.

### AI's Role

AI generated the `location.state` pattern as the cart transport mechanism. It is a valid React Router feature, but inappropriate for persistent cart state that must be accessible from any component at any point in the session. AI later helped design the `CartContext` replacement once the flaw was understood.

### Debugging Process

1. Opened React DevTools while on `CartScreen` after navigating from the header icon.
2. Inspected the `location` object — `state` was `null`.
3. Repeated with the "Go to Cart" button from `ResultsScreen` — `state` contained the cart array.
4. This confirmed the bug was not in `CartScreen` rendering logic but in how cart data was being carried to the screen: only one navigation path provided it.

### The Fix

Replaced `location.state` with `CartContext` backed by `localStorage`, accessible from any component without depending on how the user navigated.

**Before (ResultsScreen):**
```typescript
navigate('/cart', { state: { cartItems: [...cart, product] } });
```

**Before (CartScreen):**
```typescript
const { cartItems } = location.state as { cartItems: Product[] };
```

**After (CartContext.tsx):**
```typescript
const STORAGE_KEY = 'swag_cart';

function loadFromStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(loadFromStorage); // reads localStorage on mount

  function addItem(product: Product): void {
    const next = [...items, product];
    setItems(next);
    saveToStorage(next); // writes localStorage on every change
  }
  // ...
}
```

**After (CartScreen):**
```typescript
const { items, totalPrice, removeItem } = useCart(); // reads from context, not location
```

`CartScreen` now reads from the context regardless of navigation path. `Header` also reads `getItemCount()` from the same context to display the badge count — something impossible with the `location.state` approach.

### Lesson Learned

React Router `location.state` is appropriate for one-time transient data (e.g., a success message after a redirect). It is not appropriate for shared application state that must survive navigation, back-button use, or page refresh. Persistent user state belongs in a context with a stable backing store.

---

## Bug 3 — Remove Button Did Nothing

### Description

Clicking the "Remove" button on any item in `CartScreen` appeared to have no effect. The item remained in the list, the total price did not change, and no error was shown.

### Discovery

Found during manual testing of the cart screen after Bug 2 was fixed. Once the cart actually displayed items, it became possible to test the Remove button — which visually appeared to work (the cursor changed, the button registered a click) but produced no visible result.

### Root Cause

The AI generated `CartScreen` with a stub handler on the Remove button:

```typescript
// CartScreen.tsx — original AI-generated stub
<button onClick={() => console.log('remove', item.id)}>
  Remove
</button>
```

The stub logged the item ID to the browser console — confirming the click was registered — but made no state change. The `CartContext` already had a working `removeItem(id)` function at this point, but the AI never connected the button to it. The context was imported for reading `items` and `totalPrice`, but `removeItem` was not destructured or called.

### AI's Role

AI generated the stub as placeholder code and did not wire the button to the existing `removeItem` function in `CartContext`. Once the issue was identified, the fix was a one-line change that AI confirmed was correct.

### Debugging Process

1. Clicked Remove and watched for any visual change — none.
2. Opened browser DevTools → Console tab.
3. Clicked Remove again — saw `remove sauce-labs-backpack` printed.
4. This confirmed the `onClick` handler was firing. The problem was in what the handler did, not whether it ran.
5. Searched `CartScreen.tsx` for `removeItem` — found it was not called anywhere in the file despite being available from `useCart()`.

### The Fix

Destructured `removeItem` from `useCart()` and wired it to the button's `onClick`.

**Before:**
```typescript
// removeItem was never destructured
const { items, totalPrice } = useCart();

// ...

<button onClick={() => console.log('remove', item.id)}>
  Remove
</button>
```

**After:**
```typescript
const { items, totalPrice, removeItem } = useCart(); // added removeItem

// ...

<button onClick={() => removeItem(item.id)}>
  Remove
</button>
```

`removeItem` filters the item out of the `items` array, calls `setItems`, and writes the updated array back to `localStorage` — so the removal persists across navigation and refresh.

### Lesson Learned

AI frequently generates stub implementations (`console.log`, `TODO`, empty functions) as placeholders and does not always flag them clearly. Any button or interactive element with a non-trivial handler should be tested manually immediately after it is generated — not after other features are built on top of it.
