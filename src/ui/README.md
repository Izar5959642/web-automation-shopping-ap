# ui/

## Responsibility

React SPA with 5 screens. Sends HTTP requests to the API layer and displays products, cart contents, cart status, checkout results, and step-by-step trace information.

## Relationships

- **Calls**: `api/` — sends HTTP requests to Express endpoints
- **Uses**: `domain/` — consumes domain types for rendering
- **Never imports from**: `automation/`, `services/`

## Main Classes/Functions

- **`SearchScreen`** — input form for search query and optional max price, triggers POST /api/search, stores SCRAPE trace step in CartContext, passes `products` and `selectedProduct` to ResultsScreen via navigation state; shows `TraceStepList` on failure
- **`ResultsScreen`** — displays product list from search results, highlights the cheapest product with a ★ Best Value badge (from `selectedProduct`), allows user to add any product to cart via POST /api/buy, stores ADD_TO_CART trace step in CartContext; shows `TraceStepList` on failure
- **`CartScreen`** — displays cart contents (product list, quantities, remove buttons, total price, checkout button)
- **`CartStatusScreen`** — shipping details form, triggers POST /api/checkout, accumulates full trace (SCRAPE + ADD_TO_CART + CHECKOUT) from CartContext and passes it to CheckoutResultScreen; shows `TraceStepList` on failure
- **`CheckoutResultScreen`** — displays success/failure status, confirmation screenshot, and full automation trace via `TraceStepList`
- **`TraceStepList`** — reusable component, renders a list of `TraceStep` objects with status icon (✅/❌), step name, duration, and error message; returns null when list is empty
- **`CartContext`** — global cart state (items, totalPrice) plus trace accumulation (`traceSteps`, `addTraceSteps`) shared across all screens

## Input

- User input: search query, max price, shipping details (firstName, lastName, postalCode)
- API responses: products, selectedProduct (cheapest), cart status, checkout result, trace steps

## Output

Rendered HTML screens with:
- Product cards (title, price, image)
- Step trace list (step name, status, duration)
- Confirmation screenshot image
- Error messages on failure
