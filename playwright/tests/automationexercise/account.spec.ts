// Linked user story: register, log in and delete an account — automationexercise.com's
// own Test Case 1 ("Register User") and Test Case 4 ("Logout User"), used here as the
// critical-path @smoke scenario for the account journey (mirrors playwright/tests/login.spec.ts
// for RWA: a POM-driven, self-contained "sign in" smoke test).
import { test, expect } from "../../fixtures/automationexercise/api";
import { buildAccountPayload } from "../../fixtures/automationexercise/test-data";
import { LoginPage } from "../../pages/automationexercise/login.page";
import { AccountInfoPage } from "../../pages/automationexercise/account-info.page";
import { NavPage } from "../../pages/automationexercise/nav.page";

test.describe("Account lifecycle @smoke", () => {
  test("registers a new user through the UI, logs out, logs back in, then deletes the account", async ({
    page,
  }) => {
    const account = buildAccountPayload();
    const loginPage = new LoginPage(page);
    const accountInfoPage = new AccountInfoPage(page);
    const nav = new NavPage(page);

    // --- Register ---
    await loginPage.goto();
    await loginPage.startSignup(account.name, account.email);

    await expect(accountInfoPage.page.getByText("Enter Account Information")).toBeVisible();
    await accountInfoPage.fillAndSubmit(account);

    await expect(accountInfoPage.accountCreatedHeading).toBeVisible();
    await accountInfoPage.continueButton.click();
    await expect(nav.loggedInAs).toContainText(account.name);

    // --- Logout / log back in ---
    await nav.logoutLink.click();
    await expect(page).toHaveURL(/\/login$/);

    await loginPage.login(account.email, account.password);
    await expect(nav.loggedInAs).toContainText(account.name);

    // --- Delete account (cleanup, also the assertion for Test Case 1's final step) ---
    await nav.deleteAccountLink.click();
    await expect(accountInfoPage.accountDeletedHeading).toBeVisible();
    await accountInfoPage.continueButton.click();
  });

  test("rejects login with a wrong password for a registered account", async ({ page, aeApi }) => {
    const account = buildAccountPayload();
    const created = await aeApi.createAccount(account);
    expect(created.status()).toBe(200);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(account.email, "not-the-right-password");

    await expect(loginPage.loginErrorMessage).toBeVisible();

    // Cleanup via API — this test never reaches a logged-in state to delete through the UI.
    const deleted = await aeApi.deleteAccount(account.email, account.password);
    expect(deleted.status()).toBe(200);
  });
});
