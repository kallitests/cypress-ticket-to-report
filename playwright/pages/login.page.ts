import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model — Playwright's idiomatic replacement for the raw
 * `cy.getByTestId(...)` chains in cypress/e2e/smoke/login.cy.ts. Same
 * `data-test` attributes (RWA's own convention, not `data-cy` — see
 * docs/adr/0002), just wrapped once instead of repeated per assertion.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly sidenavUsername: Locator;
  readonly personalTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId("signin-username");
    this.passwordInput = page.getByTestId("signin-password");
    this.submitButton = page.getByTestId("signin-submit");
    this.errorMessage = page.getByTestId("signin-error");
    this.sidenavUsername = page.getByTestId("sidenav-username");
    this.personalTab = page.getByTestId("nav-personal-tab");
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
