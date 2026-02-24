# CLAUDE.md

## 1. What is this project

Web automation shopping app. Target site: Swag Labs (saucedemo.com). Stack: React + Express + Playwright + TypeScript.

## 2. How to run

- `npm run dev` — start the app
- `npm test` — run unit tests
- `npm run test:e2e` — run E2E tests

## 3. Architecture rules

- 5 layers: `automation`, `domain`, `services`, `api`, `ui`
- Never import across layers incorrectly
- Domain layer has zero imports from other layers

## 4. Coding rules

- Use OOP — every layer is a class
- Follow SOLID principles
- Open/Closed: extend `BaseScraper` to add new scrapers, never modify it
- TypeScript strict mode
- One class per file

## 5. Automation rules

- Never use `sleep`
- Always use explicit waits
- Always define timeouts
- Use stable selectors only

## 6. Workflow Rules

- Work in layers — create file structure with types/interfaces first, then implement logic
- Never write full implementation on first pass unless explicitly instructed
- Ask for confirmation before implementing complex logic

## Golden Rule

- Never create files, folders, or run commands unless explicitly instructed in the current prompt.
- Before creating any file inside a layer folder, always read the README.md of that folder first
