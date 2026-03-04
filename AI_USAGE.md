# AI_USAGE.md

## 1. AI Tools Used

| Tool | Interface | Used For |
|------|-----------|----------|
| Claude Code | CLI (`claude-sonnet-4-6`) | Writing and editing code directly in the project — scaffolding layers, implementing classes, fixing bugs, running searches across files |
| Claude.ai | Web chat | Thinking through design decisions before writing code — discussing architecture tradeoffs, reviewing generated outputs, and drafting documentation |

Claude Code was the primary tool for hands-on development. Claude.ai was used earlier in the process when the goal was to think out loud rather than immediately produce code.

---

## 2. Real Prompts Written During Development

### Prompt 1 — Project Setup

> "I'm building a web automation shopping app targeting saucedemo.com. Stack: React + Vite + Express + Playwright + TypeScript. I need a strict 5-layer architecture: automation, domain, services, api, ui. Start with the domain layer only — create TypeScript interfaces for Product, Cart, and Order. No implementation yet, just types and interfaces. The domain layer must have zero imports from any other layer in the project."

**Context:** This was the first prompt of the project. Forcing types-first before any logic meant the shape of data was agreed on before implementation began, which prevented the layers from drifting apart later.

---

### Prompt 2 — Playwright Scraper

> "Implement SwaglabsScraper as a class extending BaseScraper. Target site: saucedemo.com. It needs these methods: login(username, password), search(query) that scrapes all products from the inventory page DOM and returns RawProduct[], addToCart(productId), checkout(shippingDetails) that fills the three-field form, and takeScreenshot(filename) that saves to a screenshots/ folder. Rules: no sleep(), no fixed delays — explicit Playwright waits only. Define a NAVIGATION_TIMEOUT constant and apply it to every wait call. Extract all CSS selectors into a separate file at automation/selectors/swaglabs.ts."

**Context:** The constraint about selectors in a separate file was deliberate — it paid off when selectors needed to be adjusted during testing without touching the scraper logic.

---

### Prompt 3 — CartContext with localStorage

> "Create a CartContext for the React app using createContext and a custom useCart hook. It should wrap the entire app and persist the cart to localStorage under the key 'swag_cart' so the cart survives page refreshes. Expose: items (Product[]), totalPrice (computed), addItem(product), removeItem(id), clearCart(), and getItemCount(). The context should initialize by reading from localStorage on mount, and write back on every change."

**Context:** This prompt came after an earlier version of the cart broke on refresh (see Wrong Suggestions #2). The explicit mention of localStorage initialization on mount was added because of that bug.

---

### Prompt 4 — Bug Fix (Cart Lost on Refresh)

> "The cart data is being passed through React Router location.state from ResultsScreen to CartScreen. When the user navigates back and then forward, or refreshes the page, the cart is empty. I need to fix this so cart state persists across navigation and refresh. The current approach of passing state through the router is wrong — replace it with a proper React context backed by localStorage. Keep the existing Product type, don't change the API."

**Context:** This was a corrective prompt written after identifying the bug described in Wrong Suggestions #2. It was important to be explicit that the Product type should stay unchanged to avoid cascading type errors.

---

### Prompt 5 — Documentation

> "Write a README.md for this project. Include: what it does, prerequisites (Node version, Playwright browser install), how to install and run (dev server, API server), how to run tests, the demo credentials for saucedemo.com, a walkthrough of the automation flow from search to checkout confirmation, and the 5-layer architecture explanation. Add a Known Limitations section that honestly lists what isn't fully wired yet."

**Context:** The Known Limitations section was specifically requested to avoid misrepresenting the project's state. The AI included it without pushback, which was useful — it documented the SelectionPolicy gap and the empty trace array.

---

## 3. Wrong or Unhelpful AI Suggestions

### Wrong Suggestion 1 — Session Timeout Not Handled

**What the AI suggested:**
The initial implementation of `start.ts` called `scraper.login()` once at server startup and assumed the Playwright session would remain valid indefinitely. There was no guard checking whether the browser context was still alive before processing each incoming API request.

**Why it was wrong:**
Playwright browser sessions can become stale — the page may navigate away, the browser context may be closed by an error, or the saucedemo.com session may expire. With no `ensureSession()` check, any API call made minutes after startup would throw cryptic Playwright errors (`Target closed`, `Execution context was destroyed`) with no recovery path.

**How it was identified:**
The issue appeared during testing when the server was left running between test runs. The second request would fail with an unclear Playwright error rather than a clean "session expired, re-logging in" message.

**How it was fixed:**
An `ensureSession()` method was added to `SwaglabsScraper` that checks whether the page is still on the expected URL before each operation and re-runs the login flow if not. This method is called at the start of `search()` and `addToCart()` rather than assuming the session from startup is still valid.

---

### Wrong Suggestion 2 — Cart State Passed via `location.state` Instead of Context

**What the AI suggested:**
When building the initial flow from `ResultsScreen` to `CartScreen`, the AI passed the cart array as React Router `location.state`:

```typescript
// ResultsScreen.tsx — original AI suggestion
navigate('/cart', { state: { cartItems: [...cart, product] } });

// CartScreen.tsx — reading it back
const { cartItems } = location.state as { cartItems: Product[] };
```

**Why it was wrong:**
`location.state` is ephemeral — it exists only for the current navigation event. Pressing the browser back button and then returning to the cart, or refreshing the page, silently drops the state and renders an empty cart with no error. It also made it impossible for the Header component to show a cart item count badge, since it had no access to the router state.

**How it was identified:**
Refreshing the CartScreen produced a blank cart with no items and no error message. This was immediately obvious during manual testing.

**How it was fixed:**
Replaced with `CartContext` backed by localStorage (see Prompt 3 above). All screens read from and write to the context. The Header component can now access `getItemCount()` from the same context without any prop drilling.

---

### Wrong Suggestion 3 — Plan Mode Triggered for Trivial Changes

**What the AI suggested:**
Claude Code invoked `EnterPlanMode` for small, clearly-scoped tasks that did not warrant a planning phase — for example, adding a "Back" button to a screen, changing a button label, or adding a missing import. This produced multi-paragraph architecture plans for changes that amounted to 2–3 lines of code, and required explicit user approval before anything was written.

**Why it was wrong:**
Plan mode is appropriate for tasks with multiple valid approaches or significant architectural impact. For tasks where the implementation is obvious from the request, triggering it adds friction without adding value — the "plan" just restated the prompt.

**How it was identified:**
The pattern became clear after the third time a single-line change was preceded by a planning proposal. The overhead was disproportionate.

**How it was fixed:**
Prompts for small changes were reworded to scope them explicitly: *"Make this small change directly without entering plan mode"* or *"Edit only this file, no other files are affected."* This reliably suppressed the unnecessary planning phase and kept iteration fast.

---

## 4. Secret Leakage Prevention

### What credentials this project uses

The only credentials in this project are the public demo credentials for [saucedemo.com](https://www.saucedemo.com):

- Username: `standard_user`
- Password: `secret_sauce`

These are intentionally published by Sauce Labs in their official documentation for testing purposes. They are not private.

### What was shared with AI tools

Only the public demo credentials above were ever included in prompts. No real passwords, API keys, session tokens, or personally identifiable information were typed into Claude Code or Claude.ai at any point during development.

When asking about authentication flows, prompts used the placeholder text `"<your_username>"` or referred to credentials abstractly rather than including real values.

### How the codebase protects secrets

- `.gitignore` includes `.env`, so any future real credentials would not be committed
- The demo credentials in `src/api/start.ts` are annotated with a comment explaining they are intentionally public and should be replaced with `process.env` reads in any real deployment
- No credentials, tokens, or sensitive values appear in API responses, logs, or screenshots
- There are no third-party API keys in this project (no OpenAI, no payment processors, no analytics)

### Pattern adopted for any real credentials

```bash
# .env — never committed
SWAG_USERNAME=your_real_username
SWAG_PASSWORD=your_real_password
```

```typescript
// start.ts — reads from environment, falls back to demo values
await scraper.login(
  process.env.SWAG_USERNAME ?? 'standard_user',
  process.env.SWAG_PASSWORD ?? 'secret_sauce'
);
```
