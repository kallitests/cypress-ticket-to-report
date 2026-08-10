import { test as base, expect, type APIRequestContext } from "@playwright/test";
import type { RwaUser } from "./rwa.types";

/**
 * RWA's own frontend bundle calls the API on this explicit origin rather
 * than a relative path — same reasoning as cypress.config.ts's `apiUrl`
 * env var (see docs/adr/0002-rwa-as-sut-custom-docker-image.md).
 */
export const API_URL = "http://localhost:3001";

/** Login password for every seeded user (see docker/rwa-entrypoint.sh). */
export const SEED_USER_PASSWORD = "s3cret";

/**
 * `db` App Actions equivalent, replacing cy.request()-based
 * cypress/support/app-actions/db.actions.ts. Built as a Playwright fixture
 * (test.extend) rather than a custom command — the idiomatic Playwright
 * pattern, see MIGRATION.md §"Fixtures".
 */
export interface DbActions {
  /** Reloads data/database.json from the deterministic seed fixture. */
  reseed(): Promise<void>;
  /** All seeded users, straight from the running SUT — never hard-coded. */
  getUsers(): Promise<RwaUser[]>;
}

function makeDbActions(request: APIRequestContext): DbActions {
  return {
    async reseed() {
      const response = await request.post(`${API_URL}/testData/seed`);
      expect(response.ok()).toBeTruthy();
    },
    async getUsers() {
      const response = await request.get(`${API_URL}/testData/users`);
      expect(response.ok()).toBeTruthy();
      const body = (await response.json()) as { results: RwaUser[] };
      return body.results;
    },
  };
}

export const test = base.extend<{ db: DbActions }>({
  db: async ({ request }, use) => {
    await use(makeDbActions(request));
  },
});

export { expect };
