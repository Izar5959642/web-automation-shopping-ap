# api/

## Responsibility

Express REST routes. Receives HTTP requests, generates requestId (UUID v4), delegates to services, and returns structured JSON responses.

## Relationships

- **Called by**: `ui/` — React SPA sends HTTP requests to these endpoints
- **Calls**: `services/` — delegates business logic to service classes
- **Uses**: `domain/` — returns domain types in JSON responses
- **Never imports from**: `automation/`, `ui/`

## Main Classes/Functions

- **`searchRoute`** — `POST /api/search` — receives query and optional maxPrice, returns products and trace
- **`buyRoute`** — `POST /api/buy` — receives productId, returns cart status and trace
- **`checkoutRoute`** — `POST /api/checkout` — receives shipping details, returns success flag, screenshot path, and trace
- **`middleware/`** — error handling, request logging, requestId generation

## Input

- `POST /api/search` — `{ query: string, maxPrice?: number }`
- `POST /api/buy` — `{ productId: string }`
- `POST /api/checkout` — `{ firstName: string, lastName: string, postalCode: string }`

## Output

All endpoints return:
```json
{
  "requestId": "uuid-v4",
  "...endpoint-specific data...",
  "trace": [{ "step": "...", "status": "...", "durationMs": 0 }]
}
```
