import type { Page, Locator } from "@playwright/test";

/**
 * The top navbar, present on every page: login state ("Logged in as X"),
 * Delete Account, Logout. Kept as its own small POM (composed into specs
 * alongside the page-specific POM) rather than duplicated — same
 * "extract, don't repeat" principle as RWA's LoginPage sidenav locators.
 * Locators use stable `href`s instead of `data-qa` since automationexercise
 * doesn't tag the navbar itself.
 */
export class NavPage {
  readonly page: Page;
  readonly loggedInAs: Locator;
  readonly deleteAccountLink: Locator;
  readonly logoutLink: Locator;
  readonly signupLoginLink: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loggedInAs = page.locator(".navbar-nav").getByText(/Logged in as/i);
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.logoutLink = page.locator('a[href="/logout"]');
    this.signupLoginLink = page.locator('a[href="/login"]');
    this.cartLink = page.locator('a[href="/view_cart"]');
  }
}
