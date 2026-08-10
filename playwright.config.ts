import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — migration target, runs alongside the Cypress suite
 * during the coexistence period (see MIGRATION.md and
 * docs/SPEC-POC-SMOKE-TESTS-CICD-PLAYWRIGHT-MCP.md §4.7).
 *
 * Same SUT as Cypress (cypress-realworld-app, started via
 * `npm run sut:up` / docker compose — see docs/adr/0002), same base URL and
 * API origin, same seeded-user password, so both suites can run against one
 * running instance of the app in CI.
 */
export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "reports/playwright-html", open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // RWA uses `data-test`, not Playwright's default `data-testid` — see
    // docs/adr/0002-rwa-as-sut-custom-docker-image.md. Keeps
    // page.getByTestId(...) usable across the whole suite.
    testIdAttribute: "data-test",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
