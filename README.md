# SauceDemo Playwright Test Automation

End-to-end UI test automation project for [SauceDemo](https://www.saucedemo.com/) built with **Playwright** and **TypeScript**.

The repository demonstrates practical browser automation, reusable Page Object classes, test fixtures, negative and edge-case scenarios, failure diagnostics, and automated execution through GitHub Actions.

## Tech stack

- Playwright Test
- TypeScript
- Node.js / npm
- GitHub Actions (CI)
- HTML test reports

## What is covered

The suite exercises multiple SauceDemo user behaviours and failure scenarios, including:

- successful authentication with `standard_user`;
- blocked authentication with `locked_out_user`;
- product-image behaviour for `problem_user`;
- delayed login / performance behaviour for `performance_glitch_user`;
- sorting/error behaviour for `error_user`;
- visual/UI checks for `visual_user`;
- inventory-page element and product-data checks.

Some scenarios intentionally target SauceDemo's built-in problematic users, so the tests can verify not only happy paths but also known abnormal application behaviour.

## Project structure

```text
.github/workflows/   GitHub Actions workflow for automated Playwright runs
data/                Test data
fixtures/            Custom Playwright fixtures
pages/               Page Object classes
screenshots/         Screenshots produced by visual checks
 tests/              Main test scenarios
utils/               Shared test/check helpers
playwright.config.ts Playwright configuration
```

The current project includes `LoginPage` and `InventoryPage` Page Objects to keep selectors and reusable browser actions separate from test scenarios. Custom fixtures provide reusable page objects to tests.

## Failure diagnostics

Playwright is configured to retain useful debugging artifacts when a test fails:

- screenshot on failure;
- trace on failure;
- video on failure;
- HTML report.

This makes failed CI runs easier to reproduce and investigate.

## CI/CD

The repository includes a **GitHub Actions** workflow that runs the Playwright suite on pushes and pull requests to `main` / `master`.

The workflow:

1. checks out the repository;
2. installs Node.js;
3. installs dependencies with `npm ci`;
4. installs Playwright browsers and system dependencies;
5. runs the test suite;
6. uploads the Playwright HTML report as a workflow artifact.

## Run locally

### Requirements

- Node.js (LTS recommended)
- npm

### Install

```bash
npm ci
npx playwright install --with-deps
```

### Run all tests

```bash
npm test
```

or:

```bash
npx playwright test
```

### Open the HTML report

```bash
npm run report
```

## Playwright configuration

The suite uses `https://www.saucedemo.com` as the base URL and runs headlessly by default. The current per-test timeout is 30 seconds.

```ts
use: {
  headless: true,
  baseURL: 'https://www.saucedemo.com',
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure'
}
```

## Why this repository exists

This project was created as a practical QA automation exercise: turning test scenarios into repeatable browser checks, organizing them into maintainable components, and running them automatically in CI rather than relying only on manual verification.

It complements my other work in Python, AI-assisted QA, workflow automation and LLM/RAG applications.

## Author

**Stanislav Tarakanov**

GitHub: https://github.com/Stasikent
