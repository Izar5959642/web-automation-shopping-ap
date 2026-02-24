# ui/

## Responsibility

React SPA with 5 screens. Sends HTTP requests to the API layer and displays products, cart contents, cart status, checkout results, and step-by-step trace information.

## Relationships

- **Calls**: `api/` — sends HTTP requests to Express endpoints
- **Uses**: `domain/` — consumes domain types for rendering
- **Never imports from**: `automation/`, `services/`

## Main Classes/Functions

- **`SearchScreen`** — input form for search query and optional max price, triggers POST /api/search
- **`ResultsScreen`** — displays product list from search results, allows user to click "Buy", shows trace sidebar
- **`CartScreen`** — displays cart contents (product list, quantities, remove buttons, total price, checkout button)
- **`CartStatusScreen`** — displays cart state after add-to-cart, shows automation step trace
- **`CheckoutResultScreen`** — displays checkout form, then shows confirmation with screenshot and trace

## Input

- User input: search query, max price, shipping details (firstName, lastName, postalCode)
- API responses: products, cart status, checkout result, trace steps

## Output

Rendered HTML screens with:
- Product cards (title, price, image)
- Step trace list (step name, status, duration)
- Confirmation screenshot image
- Error messages on failure
