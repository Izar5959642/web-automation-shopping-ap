# README Synchronization Skill

## When to use this skill
**After code changes**, identify which folder was affected (automation/, domain/, services/, api/, or ui/), then read ONLY that folder's `README.md`

## Workflow

1. **After code changes**, read the folder's `README.md`
2. **Compare** README content against actual files:
   - Are all files listed?
   - Are signatures accurate?
   - Are relationships correct?
   - Is the description still valid?
3. **If mismatch detected**, report to user:

⚠️ README out of sync in src/[folder]/

Issues found:

- [specific issue 1]
- [specific issue 2]

Should I update the README to match the current code?

4. **Wait for user confirmation** before making changes
5. **If approved**, update README by:
   - Adding new files/classes/functions
   - Removing deleted items
   - Updating changed signatures
   - Fixing relationships
   - Maintaining the structure below

## README Structure to Maintain

Each folder README must have these sections:

### Responsibility
What this layer does (1-2 sentences)

### Relationships
- **Called by**: which layers use this
- **Uses**: which layers this calls
- **Never imports from**: forbidden dependencies

### Main Classes/Functions
List each file/class with:
- Name
- Brief description
- Key method signatures

### Input
What data/parameters this layer receives

### Output
What data this layer produces

## Example (automation/README.md)

```markdown
# automation/

## Responsibility
Browser automation via Playwright. Launches headless browsers, navigates pages, interacts with DOM elements, extracts data, and captures screenshots.

## Relationships
- **Called by**: `services/` — services invoke scraper methods
- **Uses**: `domain/` — returns domain types (RawProduct, CheckoutResult)
- **Never imports from**: `api/`, `ui/`

## Main Classes/Functions
- **`BaseScraper`** (abstract) — `login()`, `search()`, `addToCart()`, `checkout()`, `takeScreenshot()`
- **`SwaglabsScraper`** (extends BaseScraper) — concrete implementation for saucedemo.com
- **`selectors/swaglabs.ts`** — CSS selectors for Swag Labs

## Input
- Credentials, search query, product ID, shipping details, requestId

## Output
- `RawProduct[]`, `CheckoutResult`, screenshot Buffer, `TraceStep[]`
```
