// Linked ticket: JIRA-101 (see tickets/ticket-101.json)
// Linked user story: docs/user-stories/US-01-login.md
// Playwright equivalent of cypress/e2e/smoke/login.cy.ts — see MIGRATION.md
// for the line-by-line comparison and rationale.
import { test, expect, SEED_USER_PASSWORD } from "../fixtures/api";
import { LoginPage } from "../pages/login.page";

test.describe("Sign in @smoke", () => {
  test.beforeEach(async ({ db, page }) => {
    await db.reseed();
    await page.goto("/");
  });

  test("logs a seeded user in with valid credentials", async ({ db, page }) => {
    const [user] = await db.getUsers();
    const loginPage = new LoginPage(page);

    await loginPage.signIn(user.username, SEED_USER_PASSWORD);

    await expect(loginPage.sidenavUsername).toContainText(user.username);
    await expect(loginPage.personalTab).toBeVisible();
  });

  test("rejects an invalid password with an explicit error", async ({ db, page }) => {
    const [user] = await db.getUsers();
    const loginPage = new LoginPage(page);

    await loginPage.signIn(user.username, "not-the-right-password");

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText("Incorrect username or password.");
  });
});
