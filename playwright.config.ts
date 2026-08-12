import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — migration target, runs alongside the Cypress suite
 * during the coexistence period (see MIGRATION.md and
 * docs/SPEC-POC-SMOKE-TESTS-CICD-PLAYWRIGHT-MCP.md §4.7).
 *
 * Two independent projects, two independent SUTs:
 *  - "rwa-chromium": cypress-realworld-app, started via `npm run sut:up` /
 *    docker compose (see docs/adr/0002). Same base URL, API origin and
 *    seeded-user password as the Cypress suite, so both can run against one
 *    running instance in CI. Uses RWA's `data-test` attribute.
 *  - "automationexercise-chromium": automationexercise.com, a public
 *    e-commerce demo site used as a *second* SUT precisely because it needs
 *    no local Docker stack — a recruiter can run `npm run pw:test:ae`
 *    against the internet with zero setup. Uses the site's own `data-qa`
 *    attribute (see playwright/pages/automationexercise/README notes in
 *    each page object for the selectors verified against the live site).
 */
export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "reports/playwright-html", open: "never" }], ["list"]],

  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "rwa-chromium",
      testDir: "./playwright/tests",
      testIgnore: "**/automationexercise/**",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3000",
        // RWA uses `data-test`, not Playwright's default `data-testid` —
        // see docs/adr/0002-rwa-as-sut-custom-docker-image.md. Keeps
        // page.getByTestId(...) usable across the whole suite.
        testIdAttribute: "data-test",
      },
    },
    {
      name: "automationexercise-chromium",
      testDir: "./playwright/tests/automationexercise",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://automationexercise.com",
        // automationexercise.com ships its own `data-qa` attribute,
        // deliberately added by the site for automation practice.
        testIdAttribute: "data-qa",
      },
    },
  ],
});
