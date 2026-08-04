import type { RwaUser } from "../types";

/**
 * App Actions for RWA's test-data backdoor (`/testData/*`), only mounted
 * when NODE_ENV is "test" or "development" (see backend/app.ts in the
 * vendored SUT). Talks to the API origin directly — see the `apiUrl`
 * comment in cypress.config.ts for why that's safe re: auth cookies.
 */
export const dbActions = {
  /** Reloads data/database.json from the deterministic database-seed.json fixture. */
  reseed(): Cypress.Chainable {
    return cy.request("POST", `${Cypress.env("apiUrl")}/testData/seed`);
  },

  /** All seeded users, straight from the running SUT — never hard-coded. */
  getUsers(): Cypress.Chainable<RwaUser[]> {
    return cy
      .request("GET", `${Cypress.env("apiUrl")}/testData/users`)
      .then((response) => response.body.results as RwaUser[]);
  },
};
