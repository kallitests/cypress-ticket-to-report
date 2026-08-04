import { defineConfig } from "cypress";
import { plugin as cypressGrepPlugin } from "@cypress/grep/plugin";
import mochawesomePlugin from "cypress-mochawesome-reporter/plugin";

export default defineConfig({
  e2e: {
    // SUT: cypress-realworld-app, started via `docker compose up` (or
    // `npm run sut:*`, see package.json) — see docs/adr/0002.
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",

    // 0 retries locally (fail fast while writing tests), 2 in CI to absorb
    // occasional flakiness without masking real regressions.
    retries: {
      runMode: 2,
      openMode: 0,
    },

    screenshotOnRunFailure: true,
    video: true,

    setupNodeEvents(on, config) {
      mochawesomePlugin(on);
      cypressGrepPlugin(config);
      return config;
    },

    env: {
      // RWA's own frontend bundle calls the API on this explicit origin
      // rather than a relative path (see vendor/cypress-realworld-app/src/
      // machines/*.ts) — the session cookie set here is still honored on
      // baseUrl because cookie scoping ignores the port (RFC 6265 §8.5), so
      // App Actions can hit the API directly without going through the
      // frontend's (partial) auth proxy. See docs/adr/0002.
      apiUrl: "http://localhost:3001",

      // Deterministic seed data — see docker/rwa-entrypoint.sh and
      // docs/adr/0003-seed-strategy.md. Login password for every seeded
      // user (SEED_DEFAULT_USER_PASSWORD in RWA's own .env).
      seedUserPassword: "s3cret",
    },
  },

  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "reports/mochawesome",
    overwrite: false,
    html: true,
    json: true,
  },
});
