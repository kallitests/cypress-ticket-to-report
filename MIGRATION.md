# Migration — Cypress → Playwright

Status: **in progress (V2)**. The Cypress suite (`cypress/`) is the
reference implementation and is not being removed — see
[docs/SPEC-POC-SMOKE-TESTS-CICD-PLAYWRIGHT-MCP.md](docs/SPEC-POC-SMOKE-TESTS-CICD-PLAYWRIGHT-MCP.md)
for why the two suites coexist during the migration, and the target
end-state.

## Scenario migrated so far: sign in (`JIRA-101`, `@smoke`)

| Aspect | Cypress (`cypress/e2e/smoke/login.cy.ts`) | Playwright (`playwright/tests/login.spec.ts`) | Why |
|---|---|---|---|
| Test structure | `describe(..., { tags: "@smoke" })` / `it(...)` | `test.describe("... @smoke")` / `test(...)` | Playwright has no native tag option on `describe`; the `@smoke` marker is kept in the title so `--grep @smoke` behaves the same as Cypress's `grepTags` env var. |
| Selectors | `cy.getByTestId(...)` (custom command) | `page.getByTestId(...)` (built-in locator) | RWA uses `data-test`, not Playwright's default `data-testid` — set once via `testIdAttribute: "data-test"` in `playwright.config.ts` instead of a custom command. |
| Page structure | Raw selector chains inline in the spec | `playwright/pages/login.page.ts` (Page Object Model) | Spec calls for POM on the Playwright side (§5.2); Cypress side uses App Actions instead (see [ADR 0001](docs/adr/0001-app-actions-vs-page-objects.md)) — deliberately different patterns per framework, not a 1:1 port. |
| Seed/reset via API | `dbActions.reseed()` / `dbActions.getUsers()` — Cypress custom commands wrapping `cy.request()` | `db` fixture (`playwright/fixtures/api.ts`) built with `test.extend()`, wrapping Playwright's `request` context | Direct application of spec §4.4: "Fixtures: `test.extend` en remplacement des custom commands Cypress." |
| Network requests | `cy.request()` | Playwright's `request` fixture (`APIRequestContext`) | Playwright's fixture is promise-based, no chaining needed, so `db.getUsers()` returns a plain array instead of a Cypress `Chainable`. |
| Assertions | `cy.getByTestId(...).should("contain", ...)` | `expect(locator).toContainText(...)` | Playwright's `expect` auto-retries the same way Cypress's `should` does; no behavior change, syntax only. |
| Password value | `Cypress.env("seedUserPassword")` | `SEED_USER_PASSWORD` constant exported from `playwright/fixtures/api.ts` | No Playwright equivalent to `Cypress.env()` for static config; a plain exported constant is the idiomatic replacement (`playwright.config.ts`'s `use` block is for runtime browser/context options, not arbitrary app constants). |
| Gherkin scenario | `docs/user-stories/US-01-login.md` intent, no `.feature` file wired to Cypress (no cucumber preprocessor is configured in this repo despite `docs/adr` mentioning App Actions) | `playwright/features/login.feature` — kept as documentation, not wired to a runner | Neither suite currently executes Gherkin directly; the `.feature` file mirrors the scenario in both `playwright/features/` and the ticket for traceability, per spec §5.2. |
| Reporting | Mochawesome (`reports/mochawesome/`) | Playwright HTML Report (`reports/playwright-html/`) | Both configured to write under `reports/`, both gitignored, both intended as CI artifacts — see spec §4.9 for the reporting handover plan. |

## Not yet migrated

- `cypress/e2e/smoke/new-transaction-payment.cy.ts` (payment flow) — still Cypress-only.
- `@regression` / `@api` suites (per README status table, these were never implemented on the Cypress side either).
- Playwright CLI (`codegen`, `init-agents`) usage on a new scenario — spec §4.5, not started.
- Playwright MCP session (`@playwright/mcp` + Claude Code) — spec §4.6, not started. Will be documented in `mcp-sessions/MCP-SESSION.md` when it happens.
- CI wiring to run both suites in the same workflow (spec §4.7) — the GitHub Actions workflows in this repo do not yet invoke Playwright.
- Kubernetes manifests still target the Cypress-only image.

## Switchover milestone

Per spec §4.7: once Playwright's coverage reaches parity with Cypress's on
this POC's scope, the Cypress workflow step moves to `continue-on-error`
and is eventually removed. Not reached yet — only one of two smoke
scenarios is migrated.
