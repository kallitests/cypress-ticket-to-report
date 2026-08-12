import type { Page, Locator } from "@playwright/test";

/**
 * /login hosts two independent forms side by side: "Login to your account"
 * and "New User Signup!". Page Object Model, same pattern as
 * playwright/pages/login.page.ts for RWA — selectors use automationexercise's
 * own `data-qa` attribute (`testIdAttribute: "data-qa"` on the
 * "automationexercise-chromium" project, see playwright.config.ts), the
 * site's advertised convention for automation practice, verified against
 * the live page's documented markup (see docs on automationexercise.com/api_list
 * and /test_cases for the same attributes referenced in their own tutorials).
 */
export class LoginPage {
  readonly page: Page;

  // Login form
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginSubmitButton: Locator;
  readonly loginErrorMessage: Locator;

  // Signup form (name + email only — full details collected on the next page)
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupSubmitButton: Locator;
  readonly signupErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginEmailInput = page.getByTestId("login-email");
    this.loginPasswordInput = page.getByTestId("login-password");
    this.loginSubmitButton = page.getByTestId("login-button");
    this.loginErrorMessage = page.getByText("Your email or password is incorrect!");

    this.signupNameInput = page.getByTestId("signup-name");
    this.signupEmailInput = page.getByTestId("signup-email");
    this.signupSubmitButton = page.getByTestId("signup-button");
    this.signupErrorMessage = page.getByText("Email Address already exist!");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginSubmitButton.click();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupSubmitButton.click();
  }
}
