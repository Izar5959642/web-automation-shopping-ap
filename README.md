# Web Automation Shopping App

A full-stack web application that automates product search, cart management, and checkout on [Swag Labs (saucedemo.com)](https://www.saucedemo.com) using browser automation. Built as a course assignment.

**Stack:** React · Express · Playwright · TypeScript

---

## What it does

1. **Search** — enter a product query and optional max price; the app opens a real browser, logs into Swag Labs, and returns matching products
2. **Add to Cart** — select products to add; cart state persists across page refreshes via `localStorage`
3. **Checkout** — fill in shipping details; the app completes the checkout flow on saucedemo.com and returns a confirmation screenshot

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- Playwright browsers installed (see setup below)

---

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd hw_assignment

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (needed for automation)
npx playwright install chromium
```

---

## Running the app

```bash
# Start both the Express API (port 3000) and React UI (port 5173)
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

To run each server separately:

```bash
npm run dev:api   # Express API only — port 3000
npm run dev:ui    # React UI only  — port 5173
```

---

## Running tests

```bash
# Unit tests (Vitest)
npm test

# End-to-end tests (Playwright Test) — runs against live saucedemo.com
npm run test:e2e
```

---

## Demo credentials

The app connects to [saucedemo.com](https://www.saucedemo.com) using the built-in demo account — no configuration needed:

| Field | Value |
|-------|-------|
| Username | `standard_user` |
| Password | `secret_sauce` |

---

## Usage example

1. Open the app at `http://localhost:5173`
2. Type a search query (e.g. `backpack`) and optionally set a max price, then click **Search**
3. Browse results — click **Add to Cart** on any product; the cart badge in the header updates
4. Click the cart icon (top right) to open your cart; review items and click **Proceed to Checkout**
5. Fill in your first name, last name, and postal code, then click **Complete Checkout**
6. The confirmation screen displays a screenshot of the completed order on saucedemo.com

---

## Architecture

The app is organised into 5 strict layers. Dependencies only flow downward — upper layers call lower layers, never the reverse.

```
src/
├── automation/   # Playwright browser automation — BaseScraper (abstract) + SwaglabsScraper
├── domain/       # Pure TypeScript types — Product, RawProduct, Cart, Order, Trace
├── services/     # Business logic — SearchService, PurchaseService, SelectionPolicy
├── api/          # Express REST API — routes, requestId middleware, server bootstrap
└── ui/           # React SPA — screens, CartContext (global state), Header component
```

| Layer | Responsibility |
|-------|---------------|
| `automation/` | All browser interaction via Playwright; selectors centralised in `selectors/swaglabs.ts` |
| `domain/` | Shared data models with zero external imports |
| `services/` | Orchestrates flows; calls automation through the `BaseScraper` interface |
| `api/` | Express routes; generates a `requestId` (UUID v4) for every request |
| `ui/` | React SPA; cart state managed via `CartContext` with `localStorage` persistence |

Adding support for a new website means adding a new class that extends `BaseScraper` — no changes required to `services/`, `api/`, or `ui/`.

---

## Implementation status

All planned features are implemented and working end-to-end:
- SelectionPolicy (cheapest product) is active and highlighted in the UI
- Full trace observability across all 3 automation steps
- Checkout screenshot captured and displayed on the confirmation screen
