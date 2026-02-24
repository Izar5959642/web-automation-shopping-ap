# domain/

## Responsibility

Pure TypeScript types and models. Defines the data structures used across the entire application. Contains zero business logic and zero side effects.

## Relationships

- **Imported by**: all other layers (`automation/`, `services/`, `api/`, `ui/`)
- **Imports from**: nothing — this layer has zero imports from other layers

## Main Classes/Functions

- **`RawProduct`** — raw scraped product: id, title, price, currency, imageUrl, productUrl, source
- **`Product`** — normalized product with id, title, price, currency, imageUrl, productUrl, source
- **`Cart`** — cart state: items, total price, item count
- **`Order`** — completed order: orderId, products, total, timestamp
- **`Trace`** — observability types: TraceStep (step name, status, durationMs, error), StepName enum

## Input

N/A — domain types are pure data definitions, they receive no input.

## Output

TypeScript interfaces and types consumed by all other layers.
