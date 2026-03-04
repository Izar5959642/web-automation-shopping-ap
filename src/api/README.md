# api/

## Responsibility

Express REST routes. Receives HTTP requests, generates requestId (UUID v4), delegates to services, and returns structured JSON responses.

## Relationships

- **Called by**: `ui/` — React SPA sends HTTP requests to these endpoints
- **Calls**: `services/` — delegates business logic to service classes
- **Uses**: `domain/` — returns domain types in JSON responses
- **Never imports from**: `automation/`, `ui/`

## Main Classes/Functions

- **`TraceCollector`** — wraps async operations, records timing and status for each named step, logs each step as structured JSON to the terminal. Methods: `record(requestId, step, fn)`, `getSteps()`
- **`searchRoute`** — `POST /api/search` — receives query and optional maxPrice, calls `selectCheapest()` to identify the lowest-priced product, returns products, selectedProduct, and trace
- **`buyRoute`** — `POST /api/buy` — receives full Product object, returns cart status and trace
- **`checkoutRoute`** — `POST /api/checkout` — receives shipping details, returns success flag, screenshot path, and trace
- **`middleware/`** — error handling, request logging, requestId generation

## Input

- `POST /api/search` — `{ query: string, maxPrice?: number }`
- `POST /api/buy` — `{ product: Product }`
- `POST /api/checkout` — `{ firstName: string, lastName: string, postalCode: string }`

## Output

All endpoints return `trace[]` on both success and failure:
```json
{
  "requestId": "uuid-v4",
  "...endpoint-specific data...",
  "trace": [{ "step": "...", "status": "done|failed", "durationMs": 0, "error": null }]
}
```
On error, the response is `{ "error": "message", "trace": [...] }` with HTTP 500.

`POST /api/search` additionally returns:
```json
{
  "selectedProduct": { "id": "...", "title": "...", "price": 7.99, "..." }
}
```
`selectedProduct` is the cheapest product from the results (via `SelectionPolicy`), or `null` if no products were found.
