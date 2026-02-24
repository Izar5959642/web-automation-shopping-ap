# public/

## Responsibility

Serves React static files. Contains the built React SPA output (HTML, CSS, JS bundles) that the Express server serves to the browser.

## Relationships

- **Built from**: `ui/` — React build output is placed here
- **Served by**: `api/` — Express serves this directory as static middleware

## Main Classes/Functions

N/A — this is a build output directory, not a code layer.

## Input

- Built assets from the React compilation step

## Output

- `index.html` — SPA entry point
- JS and CSS bundles
- Static assets (images, fonts)
